/**
 * 2024 승강기 사고 사례 분석 포털 - 핵심 컨트롤러
 * - 항목별 사고사례 이동 (카테고리 간 재배치 및 순서 변경)
 * - 사고사례 제목 실시간 수정 및 영구 보존
 * - 로컬 스토리지 & 서버 API 자동 동기화
 */

// Application State
const appState = {
  view: "home", // "home" | "case"
  currentCategoryId: null,
  currentSubitemId: null,
  currentCaseIndexInSubitem: 0,
  currentCase: null,
  zoomLevel: 1.0,
  theme: localStorage.getItem("theme") || "light",
  
  // Custom Overrides (Saved to server & localStorage)
  customTitles: {},
  activeCategoriesConfig: [],
  selectedMoveTargetId: null
};

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  await loadCustomData();
  renderCategoryGrid();
  setupGlobalEvents();
});

/* ---------------- THEME CONTROLLER ---------------- */
function initTheme() {
  document.documentElement.setAttribute("data-theme", appState.theme);
  updateThemeIcon();
}

function toggleTheme() {
  appState.theme = appState.theme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", appState.theme);
  localStorage.setItem("theme", appState.theme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.innerHTML = appState.theme === "light" ? "🌙" : "☀️";
    btn.title = appState.theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환";
  }
}

const CURRENT_DATA_VERSION = "2024_all_5_books_v13";
const COMPATIBLE_VERSIONS = [
  "2024_all_5_books_v3",
  "2024_all_5_books_v4",
  "2024_all_5_books_v5",
  "2024_all_5_books_v6",
  "2024_all_5_books_v7",
  "2024_all_5_books_v8",
  "2024_all_5_books_v9",
  "2024_all_5_books_v10",
  "2024_all_5_books_v11",
  "2024_all_5_books_v12",
  "2024_all_5_books_v13"
];

function mergeCategoriesConfig(baseConfig, savedConfig) {
  if (!Array.isArray(savedConfig)) return JSON.parse(JSON.stringify(baseConfig));
  let merged = JSON.parse(JSON.stringify(savedConfig));

  // Migrate legacy 'hoistway' category into 'cartop' and 'pit'
  const oldHoistwayIdx = merged.findIndex(c => c.id === "hoistway");
  if (oldHoistwayIdx !== -1) {
    const oldHoistway = merged[oldHoistwayIdx];
    const baseCartop = baseConfig.find(c => c.id === "cartop");
    const basePit = baseConfig.find(c => c.id === "pit");

    const newCartop = JSON.parse(JSON.stringify(baseCartop));
    const newPit = JSON.parse(JSON.stringify(basePit));

    // Preserve custom case placements from oldHoistway where applicable
    if (Array.isArray(oldHoistway.items)) {
      const findOldItem = (id) => oldHoistway.items.find(i => i.id === id);

      const oldDoor = findOldItem("hoistway-door");
      const oldOverload = findOldItem("hoistway-overload");
      const oldInterlock = findOldItem("hoistway-interlock-hanger");
      const oldEtc = findOldItem("hoistway-etc");
      const oldBuffer = findOldItem("hoistway-buffer");
      const oldRetention = findOldItem("hoistway-door-retention");
      const oldLadder = findOldItem("hoistway-pit-ladder");
      const oldClearance = findOldItem("hoistway-clearance");

      if (oldDoor && oldInterlock && oldRetention) {
        const t = newCartop.items.find(i => i.id === "hoistway-door");
        if (t) t.caseIds = oldDoor.caseIds.slice();
      }
      if (oldOverload) {
        const t = newCartop.items.find(i => i.id === "hoistway-overload");
        if (t) t.caseIds = oldOverload.caseIds.slice();
      }
      if (oldInterlock) {
        const t = newCartop.items.find(i => i.id === "hoistway-interlock-hanger");
        if (t) t.caseIds = oldInterlock.caseIds.slice();
      }
      if (oldEtc) {
        const t = newCartop.items.find(i => i.id === "hoistway-etc");
        if (t) t.caseIds = oldEtc.caseIds.filter(id => id !== 39);
      }
      if (oldBuffer) {
        const t = newPit.items.find(i => i.id === "hoistway-buffer");
        if (t) t.caseIds = oldBuffer.caseIds.filter(id => id !== 37);
      }
      if (oldRetention) {
        const t = newPit.items.find(i => i.id === "hoistway-door-retention");
        if (t) t.caseIds = oldRetention.caseIds.slice();
      }
      if (oldLadder) {
        const t = newPit.items.find(i => i.id === "hoistway-pit-ladder");
        if (t) t.caseIds = oldLadder.caseIds.slice();
      }
      if (oldClearance) {
        const cleanClearance = oldClearance.caseIds.filter(id => ![16, 19, 31, 32, 33].includes(id));
        const cartopCl = newCartop.items.find(i => i.id === "cartop-clearance");
        const pitCl = newPit.items.find(i => i.id === "pit-clearance");
        if (cartopCl && pitCl) {
          cartopCl.caseIds = cleanClearance.filter(id => id === 14);
          pitCl.caseIds = cleanClearance.filter(id => id !== 14);
        }
      }
    }

    merged.splice(oldHoistwayIdx, 1, newCartop, newPit);
  }

  baseConfig.forEach((baseCat, catIdx) => {
    let targetCat = merged.find(c => c.id === baseCat.id);
    if (!targetCat) {
      // Remove default escalator equipment cases (17, 25, 60) from 'user' category if 'escalator' is newly added
      if (baseCat.id === "escalator") {
        const userCat = merged.find(c => c.id === "user");
        if (userCat && Array.isArray(userCat.items)) {
          userCat.items.forEach(item => {
            if (Array.isArray(item.caseIds)) {
              item.caseIds = item.caseIds.filter(id => ![17, 25, 60].includes(id));
            }
          });
        }
      }
      // Insert at matching index position
      merged.splice(Math.min(catIdx, merged.length), 0, JSON.parse(JSON.stringify(baseCat)));
      return;
    }
    targetCat.name = baseCat.name;
    targetCat.subtitle = baseCat.subtitle;
    baseCat.items.forEach((baseItem, itemIdx) => {
      const existingItem = targetCat.items.find(i => i.id === baseItem.id);
      if (!existingItem) {
        if (baseItem.id === "car-doorgap") {
          const doorSafety = targetCat.items.find(i => i.id === "car-doorsafety");
          if (doorSafety && Array.isArray(doorSafety.caseIds)) {
            doorSafety.caseIds = doorSafety.caseIds.filter(id => id !== 44);
          }
        }
        if (baseItem.id === "user-worker") {
          const hoistwayCat = merged.find(c => c.id === "hoistway");
          const clearanceItem = hoistwayCat && hoistwayCat.items ? hoistwayCat.items.find(i => i.id === "hoistway-clearance") : null;
          if (clearanceItem && Array.isArray(clearanceItem.caseIds)) {
            clearanceItem.caseIds = clearanceItem.caseIds.filter(id => ![16, 19, 33].includes(id));
          }
        }
        if (baseItem.id === "mr-governor") {
          const hoistwayCat = merged.find(c => c.id === "hoistway");
          const etcItem = hoistwayCat && hoistwayCat.items ? hoistwayCat.items.find(i => i.id === "hoistway-etc") : null;
          if (etcItem && Array.isArray(etcItem.caseIds)) {
            etcItem.caseIds = etcItem.caseIds.filter(id => id !== 39);
          }
        }
        if (baseItem.id === "hoistway-overload") {
          const bufferItem = targetCat.items.find(i => i.id === "hoistway-buffer");
          if (bufferItem && Array.isArray(bufferItem.caseIds)) {
            bufferItem.caseIds = bufferItem.caseIds.filter(id => id !== 37);
          }
        }
        if (baseItem.id === "hoistway-door-retention") {
          const doorItem = targetCat.items.find(i => i.id === "hoistway-door");
          if (doorItem && Array.isArray(doorItem.caseIds)) {
            doorItem.caseIds = doorItem.caseIds.filter(id => ![7, 27, 28].includes(id));
          }
        }
        if (baseItem.id === "hoistway-pit-ladder") {
          const clearanceItem = targetCat.items.find(i => i.id === "hoistway-clearance");
          if (clearanceItem && Array.isArray(clearanceItem.caseIds)) {
            clearanceItem.caseIds = clearanceItem.caseIds.filter(id => ![31, 32].includes(id));
          }
        }
        if (baseItem.id === "hoistway-interlock-hanger") {
          const doorItem = targetCat.items.find(i => i.id === "hoistway-door");
          if (doorItem && Array.isArray(doorItem.caseIds)) {
            doorItem.caseIds = doorItem.caseIds.filter(id => ![15, 29, 30].includes(id));
          }
        }
        // If 'hoistway-etc' exists in targetCat, insert before 'hoistway-etc'
        const etcIdx = targetCat.items.findIndex(i => i.id === "hoistway-etc");
        if (baseCat.id === "hoistway" && baseItem.id !== "hoistway-etc" && etcIdx !== -1) {
          targetCat.items.splice(etcIdx, 0, JSON.parse(JSON.stringify(baseItem)));
        } else {
          targetCat.items.push(JSON.parse(JSON.stringify(baseItem)));
        }
      } else {
        existingItem.name = baseItem.name;
        existingItem.desc = baseItem.desc;
      }
    });

    targetCat.items.forEach((item, idx) => {
      item.num = idx + 1;
    });
  });

  // Remove deprecated 'user-pinch' and moved 'user-escalator' from 'user' category and migrate to 'escalator'
  const userCat = merged.find(c => c.id === "user");
  const escCat = merged.find(c => c.id === "escalator");
  if (userCat && Array.isArray(userCat.items)) {
    const pinchItem = userCat.items.find(i => i.id === "user-pinch");
    if (pinchItem && escCat && Array.isArray(escCat.items)) {
      const stepComb = escCat.items.find(i => i.id === "es-step-comb");
      const trussEtc = escCat.items.find(i => i.id === "es-truss-etc");
      (pinchItem.caseIds || []).forEach(cId => {
        if ([2, 6, 59].includes(cId) && stepComb && !stepComb.caseIds.includes(cId)) {
          stepComb.caseIds.push(cId);
        } else if (trussEtc && !trussEtc.caseIds.includes(cId)) {
          trussEtc.caseIds.push(cId);
        }
      });
    }

    const userEscItem = userCat.items.find(i => i.id === "user-escalator");
    if (userEscItem && escCat && Array.isArray(escCat.items)) {
      const targetEscItem = escCat.items.find(i => i.id === "user-escalator");
      if (targetEscItem) {
        (userEscItem.caseIds || []).forEach(cId => {
          if (!targetEscItem.caseIds.includes(cId)) {
            targetEscItem.caseIds.push(cId);
          }
        });
      } else {
        escCat.items.push(JSON.parse(JSON.stringify(userEscItem)));
      }
    }

    userCat.items = userCat.items.filter(i => i.id !== "user-pinch" && i.id !== "user-escalator");
    userCat.items.forEach((item, idx) => {
      item.num = idx + 1;
    });
  }

  if (escCat && Array.isArray(escCat.items)) {
    escCat.items.forEach((item, idx) => {
      item.num = idx + 1;
    });
  }

  // Ensure any case in CASES_DATA not assigned to any category is placed into 'uncategorized'
  const assignedSet = new Set();
  merged.forEach(cat => {
    (cat.items || []).forEach(item => {
      (item.caseIds || []).forEach(id => assignedSet.add(id));
    });
  });

  const uncatCat = merged.find(c => c.id === "uncategorized");
  const baseUncatCat = baseConfig.find(c => c.id === "uncategorized");
  if (uncatCat && baseUncatCat) {
    baseUncatCat.items.forEach(baseSub => {
      const targetSub = uncatCat.items.find(i => i.id === baseSub.id);
      if (targetSub) {
        (baseSub.caseIds || []).forEach(cId => {
          if (!assignedSet.has(cId)) {
            targetSub.caseIds.push(cId);
            assignedSet.add(cId);
          }
        });
      }
    });
  }

  return merged;
}

/* ---------------- DATA PERSISTENCE & SYNC ---------------- */
async function loadCustomData() {
  // 1. Deep clone base categories config
  appState.activeCategoriesConfig = JSON.parse(JSON.stringify(CATEGORIES_CONFIG));
  appState.customTitles = {};

  // 2. Try fetching from local storage first (instant)
  try {
    const localSaved = localStorage.getItem("elevator_portal_custom_data");
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (parsed.customTitles) appState.customTitles = parsed.customTitles;
      if (COMPATIBLE_VERSIONS.includes(parsed.dataVersion) && parsed.categoriesConfig) {
        appState.activeCategoriesConfig = mergeCategoriesConfig(CATEGORIES_CONFIG, parsed.categoriesConfig);
      }
    }
  } catch (e) {
    console.warn("Failed to read localStorage:", e);
  }

  // 3. Try fetching from server API (sync across devices/browsers)
  try {
    const res = await fetch("/api/data");
    if (res.ok) {
      const serverData = await res.json();
      if (serverData.customTitles && Object.keys(serverData.customTitles).length > 0) {
        appState.customTitles = Object.assign({}, appState.customTitles, serverData.customTitles);
      }
      if (
        COMPATIBLE_VERSIONS.includes(serverData.dataVersion) &&
        serverData.categoriesConfig &&
        Array.isArray(serverData.categoriesConfig)
      ) {
        appState.activeCategoriesConfig = mergeCategoriesConfig(CATEGORIES_CONFIG, serverData.categoriesConfig);
      }
    }
  } catch (err) {
    console.log("Server API not available or static mode, relying on localStorage.");
  }
}

async function saveCustomData() {
  const payload = {
    dataVersion: CURRENT_DATA_VERSION,
    customTitles: appState.customTitles,
    categoriesConfig: appState.activeCategoriesConfig
  };

  // 1. Save to localStorage
  try {
    localStorage.setItem("elevator_portal_custom_data", JSON.stringify(payload));
  } catch (e) {
    console.warn("Failed to write localStorage:", e);
  }

  // 2. Save to server API
  try {
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.log("Could not post to server save API:", err);
  }
}

function getCaseTitle(caseData) {
  if (!caseData) return "";
  return appState.customTitles[caseData.id] || caseData.title;
}

/* ---------------- HOME: CATEGORY GRID ---------------- */
function renderCategoryGrid() {
  const container = document.getElementById("categoryGrid");
  if (!container || !appState.activeCategoriesConfig) return;

  container.innerHTML = appState.activeCategoriesConfig.map(cat => {
    const totalCasesInCat = cat.items.reduce((sum, item) => sum + (item.caseIds ? item.caseIds.length : 0), 0);

    const itemsHtml = cat.items.map(item => {
      const caseCount = item.caseIds ? item.caseIds.length : 0;
      return `
        <button class="cat-item-btn" onclick="selectSubitem('${cat.id}', '${item.id}')">
          <div class="item-btn-left">
            <span class="item-num">${item.num}</span>
            <div class="item-texts">
              <span class="item-name">${item.name}</span>
              <span class="item-desc">${item.desc}</span>
            </div>
          </div>
          <div class="item-btn-right">
            <span class="item-count-badge">${caseCount}건</span>
            <svg class="item-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </button>
      `;
    }).join("");

    return `
      <div class="category-card" style="--cat-color: ${cat.color};">
        <div class="category-card-header">
          <div class="cat-header-left">
            <div class="cat-icon-wrap">${cat.icon}</div>
            <div>
              <div class="cat-title-row">
                <h2 class="cat-title">${cat.name}</h2>
                <span class="cat-badge">${cat.badge}</span>
              </div>
            </div>
          </div>
          <span class="cat-total-count">총 ${totalCasesInCat}개 사례</span>
        </div>

        <div class="category-items-list">
          ${itemsHtml}
        </div>
      </div>
    `;
  }).join("");
}

/* ---------------- NAVIGATION CONTROLLER ---------------- */
function selectSubitem(categoryId, subitemId, caseIndex = 0) {
  const category = appState.activeCategoriesConfig.find(c => c.id === categoryId);
  if (!category) return;
  const subitem = category.items.find(i => i.id === subitemId);
  if (!subitem || !subitem.caseIds) return;

  // Handle empty item case
  if (subitem.caseIds.length === 0) {
    showToast(`'${subitem.name}' 항목에 등록된 사고 사례가 없습니다. 다른 항목에서 사례를 이동해 올 수 있습니다.`, "info");
  }

  appState.view = "case";
  appState.currentCategoryId = categoryId;
  appState.currentSubitemId = subitemId;
  appState.currentCaseIndexInSubitem = subitem.caseIds.length > 0 ? Math.max(0, Math.min(caseIndex, subitem.caseIds.length - 1)) : 0;

  // Toggle DOM views
  const homeView = document.getElementById("homeView");
  const caseView = document.getElementById("caseView");
  const navBackHomeBtn = document.getElementById("navBackHomeBtn");

  if (homeView) homeView.style.display = "none";
  if (caseView) caseView.style.display = "block";
  if (navBackHomeBtn) navBackHomeBtn.style.display = "inline-flex";

  cancelEditTitle();
  window.scrollTo({ top: 0, behavior: "smooth" });

  renderViewerTopBar(category, subitem);
  renderCaseDetail();
}

function goHome() {
  appState.view = "home";
  appState.currentCategoryId = null;
  appState.currentSubitemId = null;
  appState.currentCase = null;
  appState.zoomLevel = 1.0;

  const homeView = document.getElementById("homeView");
  const caseView = document.getElementById("caseView");
  const navBackHomeBtn = document.getElementById("navBackHomeBtn");

  if (homeView) homeView.style.display = "block";
  if (caseView) caseView.style.display = "none";
  if (navBackHomeBtn) navBackHomeBtn.style.display = "none";

  cancelEditTitle();
  renderCategoryGrid();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------- CASE VIEWER RENDERING ---------------- */
function renderViewerTopBar(category, subitem) {
  // 1. Breadcrumb
  const breadcrumbEl = document.getElementById("viewerBreadcrumb");
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `
      <span class="crumb-link" onclick="goHome()">전체 카테고리</span>
      <span class="crumb-sep">/</span>
      <span class="crumb-cat" style="color:${category.color};">${category.name}</span>
      <span class="crumb-sep">/</span>
      <span class="crumb-current">${subitem.num}. ${subitem.name}</span>
    `;
  }

  // 2. Sibling Subcategory Quick Switch Pills
  const siblingPillsEl = document.getElementById("siblingPills");
  if (siblingPillsEl) {
    siblingPillsEl.innerHTML = category.items.map(item => `
      <button class="sibling-pill ${item.id === subitem.id ? 'active' : ''}" 
              onclick="selectSubitem('${category.id}', '${item.id}', 0)">
        ${item.num}. ${item.name} (${item.caseIds ? item.caseIds.length : 0})
      </button>
    `).join("");
  }
}

function renderCaseDetail() {
  const category = appState.activeCategoriesConfig.find(c => c.id === appState.currentCategoryId);
  if (!category) return;
  const subitem = category.items.find(i => i.id === appState.currentSubitemId);
  if (!subitem) return;

  const prevBtn = document.getElementById("btnPrevCase");
  const nextBtn = document.getElementById("btnNextCase");
  const counterBadge = document.getElementById("caseCounterBadge");
  const mPrevBtn = document.getElementById("mBtnPrevCase");
  const mNextBtn = document.getElementById("mBtnNextCase");
  const mCounter = document.getElementById("mCaseCounter");
  const jumpTabsEl = document.getElementById("caseJumpTabs");

  // Empty state handling
  if (!subitem.caseIds || subitem.caseIds.length === 0) {
    if (jumpTabsEl) jumpTabsEl.innerHTML = `<span style="font-size:0.85rem;color:var(--text-dim);padding:0.4rem;">등록된 사례 없음</span>`;
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    if (counterBadge) counterBadge.textContent = "0 / 0";
    if (mPrevBtn) mPrevBtn.disabled = true;
    if (mNextBtn) mNextBtn.disabled = true;
    if (mCounter) mCounter.textContent = "0 / 0";
    
    const titleEl = document.getElementById("caseDetailTitle");
    if (titleEl) titleEl.textContent = "현재 항목에 등록된 사고 사례가 없습니다.";
    const badgesRow = document.getElementById("caseBadgesRow");
    if (badgesRow) badgesRow.innerHTML = "";
    const metaBox = document.getElementById("metaQuickBox");
    if (metaBox) metaBox.innerHTML = `<p style="color:var(--text-muted);font-size:0.88rem;">다른 항목에서 '항목 이동' 버튼을 통해 이 항목으로 사고 사례를 추가할 수 있습니다.</p>`;
    document.getElementById("caseDescList").innerHTML = "<li>등록된 내용이 없습니다.</li>";
    document.getElementById("caseCauseList").innerHTML = "<li>등록된 내용이 없습니다.</li>";
    document.getElementById("casePrevList").innerHTML = "<li>등록된 내용이 없습니다.</li>";
    document.getElementById("caseDetailImg").src = "";
    return;
  }

  const caseId = subitem.caseIds[appState.currentCaseIndexInSubitem];
  const caseData = CASES_DATA.find(c => c.id === caseId);
  if (!caseData) return;

  appState.currentCase = caseData;
  resetImgZoom();

  // 1. Render Case Jump Selector Tabs
  if (jumpTabsEl) {
    jumpTabsEl.innerHTML = subitem.caseIds.map((cId, idx) => {
      const c = CASES_DATA.find(x => x.id === cId);
      const fullTitle = c ? getCaseTitle(c) : `사례 ${idx + 1}`;
      const titleShort = fullTitle.length > 20 ? fullTitle.substring(0, 20) + "..." : fullTitle;
      return `
        <button class="case-jump-tab ${idx === appState.currentCaseIndexInSubitem ? 'active' : ''}" 
                onclick="jumpToCaseIndex(${idx})" title="${fullTitle}">
          <span class="tab-index">${idx + 1}</span>
          <span class="tab-title">${titleShort}</span>
        </button>
      `;
    }).join("");

    // Scroll active tab into view smoothly on mobile/horizontal scroll
    requestAnimationFrame(() => {
      const activeTab = jumpTabsEl.querySelector(".case-jump-tab.active");
      if (activeTab && typeof activeTab.scrollIntoView === "function") {
        activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });
  }

  // 2. Update Nav Prev/Next Buttons & Counter
  const isFirst = appState.currentCaseIndexInSubitem === 0;
  const isLast = appState.currentCaseIndexInSubitem === subitem.caseIds.length - 1;
  const counterText = `${appState.currentCaseIndexInSubitem + 1} / ${subitem.caseIds.length}`;

  if (prevBtn) prevBtn.disabled = isFirst;
  if (nextBtn) nextBtn.disabled = isLast;
  if (counterBadge) counterBadge.textContent = counterText;
  if (mPrevBtn) mPrevBtn.disabled = isFirst;
  if (mNextBtn) mNextBtn.disabled = isLast;
  if (mCounter) mCounter.textContent = counterText;

  // 3. Render Image & Page Indicator
  const imgEl = document.getElementById("caseDetailImg");
  const pageLabel = document.getElementById("mediaPageLabel");
  if (imgEl) {
    imgEl.src = caseData.image;
    imgEl.alt = getCaseTitle(caseData);
  }
  if (pageLabel) {
    pageLabel.textContent = `도서 원문 p.${caseData.bookPage || caseData.page} (사례 #${caseData.id})`;
  }

  // 4. Render Badges & Title
  const badgesRow = document.getElementById("caseBadgesRow");
  const titleEl = document.getElementById("caseDetailTitle");

  if (badgesRow) {
    const isFatal = caseData.severity.includes("사망") || (caseData.casualty && caseData.casualty.includes("사망"));
    badgesRow.innerHTML = `
      <span class="c-badge source">${caseData.source || '공단 발간 사례집'}</span>
      <span class="c-badge type">${caseData.elevatorType}</span>
      <span class="c-badge accident">${caseData.accidentType}</span>
      <span class="c-badge ${isFatal ? 'fatal' : 'injury'}">${caseData.casualty || caseData.severity}</span>
      <span class="c-badge cause">${caseData.causeType}</span>
      ${caseData.similarCount && caseData.similarCount !== '-' ? `<span class="c-badge similar">유사사고 ${caseData.similarCount}</span>` : ''}
    `;
  }
  if (titleEl) {
    titleEl.textContent = getCaseTitle(caseData);
  }

  // 5. Render Meta Quick Info
  const metaBox = document.getElementById("metaQuickBox");
  if (metaBox) {
    metaBox.innerHTML = `
      <div class="meta-item">
        <span class="m-label">핵심 요약</span>
        <span class="m-val">${caseData.summary}</span>
      </div>
    `;
  }

  // 6. Section 1: 가. 사고 내용
  const descList = document.getElementById("caseDescList");
  if (descList) {
    descList.innerHTML = caseData.description.map(text => `
      <li>${text}</li>
    `).join("");
  }

  // 7. Section 2: 나. 발생 원인
  const causeList = document.getElementById("caseCauseList");
  if (causeList) {
    causeList.innerHTML = caseData.cause.map(text => `
      <li>${text}</li>
    `).join("");
  }

  // 8. Section 3: 다. 재발 방지 대책
  const prevList = document.getElementById("casePrevList");
  if (prevList) {
    prevList.innerHTML = caseData.prevention.map(text => `
      <li>${text}</li>
    `).join("");
  }
}

/* ---------------- CASE STEPPING ---------------- */
function jumpToCaseIndex(index) {
  const category = appState.activeCategoriesConfig.find(c => c.id === appState.currentCategoryId);
  if (!category) return;
  const subitem = category.items.find(i => i.id === appState.currentSubitemId);
  if (!subitem || !subitem.caseIds) return;

  if (index >= 0 && index < subitem.caseIds.length) {
    appState.currentCaseIndexInSubitem = index;
    cancelEditTitle();
    renderCaseDetail();
  }
}

function navigateCase(direction) {
  const category = appState.activeCategoriesConfig.find(c => c.id === appState.currentCategoryId);
  if (!category) return;
  const subitem = category.items.find(i => i.id === appState.currentSubitemId);
  if (!subitem || !subitem.caseIds) return;

  const newIndex = appState.currentCaseIndexInSubitem + direction;
  if (newIndex >= 0 && newIndex < subitem.caseIds.length) {
    appState.currentCaseIndexInSubitem = newIndex;
    cancelEditTitle();
    renderCaseDetail();
  }
}

/* ---------------- TITLE EDITING CONTROLLER ---------------- */
function startEditTitle() {
  if (!appState.currentCase) return;

  const viewWrap = document.getElementById("titleViewWrap");
  const editWrap = document.getElementById("titleEditWrap");
  const inputEl = document.getElementById("caseTitleInput");

  if (viewWrap && editWrap && inputEl) {
    viewWrap.style.display = "none";
    editWrap.style.display = "flex";
    inputEl.value = getCaseTitle(appState.currentCase);
    inputEl.focus();
    inputEl.select();

    // Key handlers for Enter / ESC
    inputEl.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEditTitle();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEditTitle();
      }
    };
  }
}

function saveEditTitle() {
  if (!appState.currentCase) return;

  const inputEl = document.getElementById("caseTitleInput");
  if (!inputEl) return;

  const newTitle = inputEl.value.trim();
  if (!newTitle) {
    showToast("사고 제목을 입력해 주세요.", "error");
    return;
  }

  // Update in state
  appState.customTitles[appState.currentCase.id] = newTitle;
  saveCustomData();

  // Re-render
  cancelEditTitle();
  renderCaseDetail();
  showToast("사고사례 제목이 성공적으로 수정되었습니다.");
}

function cancelEditTitle() {
  const viewWrap = document.getElementById("titleViewWrap");
  const editWrap = document.getElementById("titleEditWrap");

  if (viewWrap && editWrap) {
    viewWrap.style.display = "block";
    editWrap.style.display = "none";
  }
}

/* ---------------- MOVE CASE MODAL CONTROLLER ---------------- */
function openMoveCaseModal() {
  if (!appState.currentCase) return;

  const modal = document.getElementById("moveCaseModal");
  const titleEl = document.getElementById("moveModalCaseTitle");
  const sourceEl = document.getElementById("moveModalCurrentSubitem");
  const treeContainer = document.getElementById("moveOptionsTree");
  const btnConfirm = document.getElementById("btnExecuteMove");

  if (!modal || !treeContainer) return;

  // Find current category & subitem
  const currentCat = appState.activeCategoriesConfig.find(c => c.id === appState.currentCategoryId);
  const currentSub = currentCat ? currentCat.items.find(i => i.id === appState.currentSubitemId) : null;

  if (titleEl) titleEl.textContent = getCaseTitle(appState.currentCase);
  if (sourceEl && currentCat && currentSub) {
    sourceEl.textContent = `${currentCat.name} > ${currentSub.num}. ${currentSub.name}`;
  }

  appState.selectedMoveTargetId = null;
  if (btnConfirm) btnConfirm.disabled = true;

  // Build radio tree
  treeContainer.innerHTML = appState.activeCategoriesConfig.map(cat => {
    const itemsHtml = cat.items.map(item => {
      const isCurrent = item.id === appState.currentSubitemId;
      const count = item.caseIds ? item.caseIds.length : 0;
      return `
        <label class="move-tree-item ${isCurrent ? 'current-item' : ''}">
          <input type="radio" name="moveTargetRadio" value="${item.id}" 
                 ${isCurrent ? 'disabled' : ''} 
                 onchange="onSelectMoveTarget('${item.id}')" />
          <div class="move-item-info">
            <span class="m-item-title">${item.num}. ${item.name}</span>
            <span class="m-item-desc">${item.desc}</span>
          </div>
          <span class="m-item-tag ${isCurrent ? 'tag-current' : 'tag-count'}">
            ${isCurrent ? '현재 소속' : `${count}건`}
          </span>
        </label>
      `;
    }).join("");

    return `
      <div class="move-tree-group">
        <div class="move-group-header" style="color: ${cat.color};">
          <span class="m-group-icon">${cat.icon}</span>
          <span class="m-group-name">${cat.name}</span>
        </div>
        <div class="move-group-items">
          ${itemsHtml}
        </div>
      </div>
    `;
  }).join("");

  modal.style.display = "flex";
}

function onSelectMoveTarget(subitemId) {
  appState.selectedMoveTargetId = subitemId;
  const btnConfirm = document.getElementById("btnExecuteMove");
  if (btnConfirm) btnConfirm.disabled = false;
}

function closeMoveCaseModal() {
  const modal = document.getElementById("moveCaseModal");
  if (modal) modal.style.display = "none";
  appState.selectedMoveTargetId = null;
}

function executeMoveCase() {
  if (!appState.currentCase || !appState.selectedMoveTargetId) return;

  const targetSubitemId = appState.selectedMoveTargetId;
  const caseId = appState.currentCase.id;

  // 1. Find source subitem and remove caseId
  let sourceFound = false;
  let targetCat = null;
  let targetSub = null;

  appState.activeCategoriesConfig.forEach(cat => {
    cat.items.forEach(item => {
      if (item.id === appState.currentSubitemId) {
        const idx = item.caseIds.indexOf(caseId);
        if (idx !== -1) {
          item.caseIds.splice(idx, 1);
          sourceFound = true;
        }
      }
      if (item.id === targetSubitemId) {
        targetCat = cat;
        targetSub = item;
      }
    });
  });

  if (!targetSub) {
    showToast("대상 항목을 찾을 수 없습니다.", "error");
    return;
  }

  // 2. Add caseId to target subitem (avoid duplicate)
  if (!targetSub.caseIds.includes(caseId)) {
    targetSub.caseIds.push(caseId);
  }

  // 3. Save state
  saveCustomData();
  closeMoveCaseModal();

  // 4. Navigate directly to the moved case in the new target category
  const newIndex = targetSub.caseIds.indexOf(caseId);
  showToast(`사례가 [${targetCat.name} > ${targetSub.name}] 항목으로 이동되었습니다.`);
  selectSubitem(targetCat.id, targetSub.id, newIndex);
}

/* ---------------- RE-ORDER CASES WITHIN ITEM ---------------- */
function moveCaseOrder(direction) {
  const category = appState.activeCategoriesConfig.find(c => c.id === appState.currentCategoryId);
  if (!category) return;
  const subitem = category.items.find(i => i.id === appState.currentSubitemId);
  if (!subitem || !subitem.caseIds || subitem.caseIds.length <= 1) return;

  const curIdx = appState.currentCaseIndexInSubitem;
  const targetIdx = curIdx + direction;

  if (targetIdx < 0 || targetIdx >= subitem.caseIds.length) {
    showToast(direction < 0 ? "이미 첫 번째 순서입니다." : "이미 마지막 순서입니다.", "info");
    return;
  }

  // Swap elements
  const temp = subitem.caseIds[curIdx];
  subitem.caseIds[curIdx] = subitem.caseIds[targetIdx];
  subitem.caseIds[targetIdx] = temp;

  appState.currentCaseIndexInSubitem = targetIdx;
  saveCustomData();
  renderCaseDetail();
  showToast("사례 순서가 변경되었습니다.");
}

/* ---------------- RESET DATA TO DEFAULTS ---------------- */
async function confirmResetData() {
  const confirmed = confirm("모든 사용자 수정 사항(사례 제목, 항목 이동 및 순서 변경)을 초기 기본값으로 복원하시겠습니까?");
  if (!confirmed) return;

  // Clear in-memory
  appState.customTitles = {};
  appState.activeCategoriesConfig = JSON.parse(JSON.stringify(CATEGORIES_CONFIG));

  // Clear localStorage
  try {
    localStorage.removeItem("elevator_portal_custom_data");
  } catch (e) {}

  // Clear server
  try {
    await fetch("/api/reset", { method: "POST" });
  } catch (e) {}

  showToast("초기 기본값으로 복원되었습니다.");

  if (appState.view === "case" && appState.currentCategoryId && appState.currentSubitemId) {
    selectSubitem(appState.currentCategoryId, appState.currentSubitemId, 0);
  } else {
    goHome();
  }
}

/* ---------------- TOAST NOTIFICATION ---------------- */
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✓'}</span>
    <span class="toast-msg">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Auto remove after 3.2s
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

/* ---------------- IMAGE ZOOM CONTROLLER ---------------- */
function zoomImg(factor) {
  appState.zoomLevel = Math.max(0.6, Math.min(3.0, appState.zoomLevel * factor));
  applyImgTransform();
}

function resetImgZoom() {
  appState.zoomLevel = 1.0;
  applyImgTransform();
}

function applyImgTransform() {
  const img = document.getElementById("caseDetailImg");
  if (img) {
    img.style.transform = `scale(${appState.zoomLevel})`;
    img.style.transformOrigin = "top center";
    img.style.transition = "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)";
  }
}

function openOriginalImage() {
  if (appState.currentCase && appState.currentCase.image) {
    window.open(appState.currentCase.image, "_blank");
  }
}

/* ---------------- MOBILE ACCESS & QR MODAL ---------------- */
const PERMANENT_WEB_URL = "https://koelsaggbb16-rgb.github.io/cs-pj/";

async function openMobileModal() {
  const modal = document.getElementById("mobileAccessModal");
  if (!modal) return;
  modal.style.display = "flex";

  let targetUrl = PERMANENT_WEB_URL;
  let allUrls = [PERMANENT_WEB_URL];
  let publicTunnel = null;

  try {
    const res = await fetch("/api/network-info");
    if (res.ok) {
      const info = await res.json();
      publicTunnel = info.publicUrl || null;
      if (info.urls && info.urls.length > 0) {
        info.urls.forEach(u => {
          if (!allUrls.includes(u)) allUrls.push(u);
        });
      }
    }
  } catch (e) {
    // Static hosting (GitHub Pages) or offline mode
  }

  renderNetworkUrlPills(allUrls, targetUrl, publicTunnel);
  setMobileAccessUrl(targetUrl);
}

function renderNetworkUrlPills(urls, activeUrl, publicUrl) {
  const wrap = document.getElementById("networkUrlSelectorWrap");
  const pillsEl = document.getElementById("networkUrlPills");
  if (!wrap || !pillsEl) return;

  if (!urls || urls.length <= 1) {
    wrap.style.display = "none";
    return;
  }

  wrap.style.display = "flex";
  pillsEl.innerHTML = urls.map(url => {
    let label = url;
    if (url === PERMANENT_WEB_URL) {
      label = `☁️ 영구 웹 주소 (언제나 접속 가능)`;
    } else if (publicUrl && url === publicUrl) {
      label = `🌐 실시간 PC 연동 터널 (${url.replace('https://', '')})`;
    } else {
      label = `🏠 내부망 Wi-Fi (${url.replace('http://', '')})`;
    }
    return `
      <button class="net-pill ${url === activeUrl ? 'active' : ''}" data-url="${url}" onclick="setMobileAccessUrl('${url}')">
        ${label}
      </button>
    `;
  }).join("");
}

function setMobileAccessUrl(url) {
  const inputEl = document.getElementById("mobileUrlInput");
  const qrImg = document.getElementById("mobileQrImg");
  if (inputEl) inputEl.value = url;
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(url)}`;
  }

  const pillsEl = document.getElementById("networkUrlPills");
  if (pillsEl) {
    Array.from(pillsEl.querySelectorAll(".net-pill")).forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-url") === url);
    });
  }
}

function copyMobileUrl() {
  const inputEl = document.getElementById("mobileUrlInput");
  if (!inputEl) return;
  inputEl.select();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(inputEl.value).then(() => {
      showToast("모바일 접속 주소가 복사되었습니다.");
    }).catch(() => {
      document.execCommand("copy");
      showToast("모바일 접속 주소가 복사되었습니다.");
    });
  } else {
    document.execCommand("copy");
    showToast("모바일 접속 주소가 복사되었습니다.");
  }
}

function closeMobileModal() {
  const modal = document.getElementById("mobileAccessModal");
  if (modal) modal.style.display = "none";
}

/* ---------------- KEYBOARD & TOUCH SWIPE EVENTS ---------------- */
function setupGlobalEvents() {
  window.addEventListener("keydown", (e) => {
    // If modal is open, ESC closes modal
    const moveModal = document.getElementById("moveCaseModal");
    if (moveModal && moveModal.style.display === "flex") {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMoveCaseModal();
      }
      return;
    }

    const mobileModal = document.getElementById("mobileAccessModal");
    if (mobileModal && mobileModal.style.display === "flex") {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMobileModal();
      }
      return;
    }

    // If inline editing title, don't trigger slide keys
    const editWrap = document.getElementById("titleEditWrap");
    if (editWrap && editWrap.style.display === "flex") {
      return;
    }

    if (appState.view !== "case") return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      navigateCase(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      navigateCase(1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      goHome();
    }
  });

  // Touch Swipe Navigation for Mobile on Case Detail Card
  const detailCard = document.getElementById("caseDetailCard");
  if (detailCard) {
    let touchStartX = 0;
    let touchStartY = 0;

    detailCard.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      // Ignore if zoomed in on image
      if (appState.zoomLevel > 1.05 && e.target.closest("#mediaContainer")) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    detailCard.addEventListener("touchend", (e) => {
      if (!touchStartX || e.changedTouches.length !== 1) return;
      if (appState.zoomLevel > 1.05 && e.target.closest("#mediaContainer")) return;

      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;

      // Trigger horizontal swipe if dx > 65px and horizontal movement dominates vertical movement
      if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.8) {
        if (dx < 0) {
          navigateCase(1); // Swipe left -> Next case
        } else {
          navigateCase(-1); // Swipe right -> Prev case
        }
      }
      touchStartX = 0;
      touchStartY = 0;
    }, { passive: true });
  }
}
