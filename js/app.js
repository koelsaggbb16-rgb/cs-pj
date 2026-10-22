/**
 * 2024 승강기 사고 사례 분석 포털 - 핵심 컨트롤러
 * - 항목별 사고사례 이동 (카테고리 간 재배치 및 순서 변경)
 * - 사고사례 제목 실시간 수정 및 영구 보존
 * - 로컬 스토리지 & 서버 API 자동 동기화
 */

// Application State
const appState = {
  view: "home", // "home" | "part" | "case"
  currentCategoryId: null,
  currentSubitemId: null,
  currentCaseIndexInSubitem: 0,
  currentCase: null,
  zoomLevel: 1.0,
  theme: localStorage.getItem("theme") || "light",
  
  // Custom Overrides (Saved to server & localStorage)
  customTitles: {},
  partPhotos: {},
  currentPartPhotoIndex: 0,
  openHomeCategoryId: null,
  activeCategoriesConfig: [],
  selectedMoveTargetId: null
};

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  await loadCustomData();
  renderCategoryGrid();
  setupGlobalEvents();
  window.addEventListener("resize", () => {
    if (appState.view === "home") renderCategoryGrid();
  });
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

const CURRENT_DATA_VERSION = "2024_all_5_books_v16";
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
  "2024_all_5_books_v13",
  "2024_all_5_books_v14",
  "2024_all_5_books_v15",
  "2024_all_5_books_v16"
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
        const t = newPit.items.find(i => i.id === "hoistway-overload");
        if (t) t.caseIds = oldOverload.caseIds.slice();
      }
      if (oldInterlock) {
        const t = newCartop.items.find(i => i.id === "hoistway-interlock-hanger");
        if (t) t.caseIds = oldInterlock.caseIds.slice();
      }
      if (oldRetention) {
        const t = newCartop.items.find(i => i.id === "hoistway-door-retention");
        if (t) t.caseIds = oldRetention.caseIds.slice();
      }
      if (oldEtc) {
        const t = newCartop.items.find(i => i.id === "hoistway-etc");
        if (t) t.caseIds = oldEtc.caseIds.filter(id => id !== 39);
      }
      if (oldBuffer) {
        const t = newPit.items.find(i => i.id === "hoistway-buffer");
        if (t) t.caseIds = oldBuffer.caseIds.filter(id => id !== 37);
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

  // If 'hoistway-door-retention' was in 'pit' (from v13), move it to 'cartop'
  const pitCat = merged.find(c => c.id === "pit");
  const cartopCat = merged.find(c => c.id === "cartop");
  if (pitCat && cartopCat && Array.isArray(pitCat.items) && Array.isArray(cartopCat.items)) {
    const pitRetentionIdx = pitCat.items.findIndex(i => i.id === "hoistway-door-retention");
    if (pitRetentionIdx !== -1) {
      const [retItem] = pitCat.items.splice(pitRetentionIdx, 1);
      const existingInCartop = cartopCat.items.find(i => i.id === "hoistway-door-retention");
      if (existingInCartop) {
        (retItem.caseIds || []).forEach(cId => {
          if (!existingInCartop.caseIds.includes(cId)) existingInCartop.caseIds.push(cId);
        });
      } else {
        const insertIdx = cartopCat.items.findIndex(i => i.id === "cartop-clearance");
        if (insertIdx !== -1) {
          cartopCat.items.splice(insertIdx, 0, retItem);
        } else {
          cartopCat.items.push(retItem);
        }
      }
      pitCat.items.forEach((item, idx) => { item.num = idx + 1; });
      cartopCat.items.forEach((item, idx) => { item.num = idx + 1; });
    }

    // If 'hoistway-overload' was in 'cartop' (from v13/v14), move it to 'pit'
    const cartopOverloadIdx = cartopCat.items.findIndex(i => i.id === "hoistway-overload");
    if (cartopOverloadIdx !== -1) {
      const [ovItem] = cartopCat.items.splice(cartopOverloadIdx, 1);
      const existingInPit = pitCat.items.find(i => i.id === "hoistway-overload");
      if (existingInPit) {
        (ovItem.caseIds || []).forEach(cId => {
          if (!existingInPit.caseIds.includes(cId)) existingInPit.caseIds.push(cId);
        });
      } else {
        const bufferIdx = pitCat.items.findIndex(i => i.id === "hoistway-buffer");
        if (bufferIdx !== -1) {
          pitCat.items.splice(bufferIdx + 1, 0, ovItem);
        } else {
          pitCat.items.push(ovItem);
        }
      }
      pitCat.items.forEach((item, idx) => { item.num = idx + 1; });
      cartopCat.items.forEach((item, idx) => { item.num = idx + 1; });
    }
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
  appState.partPhotos = {};

  // 2. Try fetching from local storage first (instant)
  try {
    const localSaved = localStorage.getItem("elevator_portal_custom_data");
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (parsed.customTitles) appState.customTitles = parsed.customTitles;
      if (parsed.partPhotos) appState.partPhotos = normalizePartPhotos(parsed.partPhotos);
      if (COMPATIBLE_VERSIONS.includes(parsed.dataVersion) && parsed.categoriesConfig) {
        appState.activeCategoriesConfig = mergeCategoriesConfig(CATEGORIES_CONFIG, parsed.categoriesConfig);
      }
    }
  } catch (e) {
    console.warn("Failed to read localStorage:", e);
  }

  // 3. Try fetching from server API (sync across devices/browsers)
  let apiLoaded = false;
  try {
    const res = await fetch("/api/data", { cache: "no-store" });
    if (res.ok) {
      apiLoaded = true;
      const serverData = await res.json();
      if (serverData.customTitles && Object.keys(serverData.customTitles).length > 0) {
        appState.customTitles = Object.assign({}, appState.customTitles, serverData.customTitles);
      }
      if (serverData.partPhotos && typeof serverData.partPhotos === "object") {
        appState.partPhotos = mergePartPhotoMaps(appState.partPhotos, normalizePartPhotos(serverData.partPhotos));
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

  if (!apiLoaded) await loadStaticSharedPhotos();
  await hydratePartPhotosFromIdb();
  publishLocalOnlyPhotos();
}

async function saveCustomData() {
  const payload = {
    dataVersion: CURRENT_DATA_VERSION,
    customTitles: appState.customTitles,
    partPhotos: sanitizePartPhotosForSave(appState.partPhotos),
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
const PRIMARY_CATEGORY_IDS = ["cartop", "pit", "car", "machineroom"];

function isCompactHome() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function setCompactHomeClass(enabled) {
  document.documentElement.classList.toggle("compact-home", enabled);
  document.body.classList.toggle("compact-home", enabled);
}

function renderCategoryGrid() {
  const container = document.getElementById("categoryGrid");
  if (!container || !appState.activeCategoriesConfig) return;

  const compact = isCompactHome();
  setCompactHomeClass(compact && appState.view === "home");

  if (compact) {
    renderCompactHome(container);
    return;
  }

  container.innerHTML = appState.activeCategoriesConfig.map(cat => renderDesktopCategoryCard(cat)).join("");
}

function countCategoryCases(cat) {
  return cat.items.reduce((sum, item) => sum + (item.caseIds ? item.caseIds.length : 0), 0);
}

function renderPartButtons(cat) {
  return cat.items.map(item => {
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
}

function renderDesktopCategoryCard(cat) {
  const totalCasesInCat = countCategoryCases(cat);
  return `
    <div class="category-card" data-cat-id="${cat.id}" style="--cat-color: ${cat.color};">
      <div class="category-card-header">
        <div class="cat-header-left">
          <div class="cat-icon-wrap">${cat.icon}</div>
          <div>
            <div class="cat-title-row">
              <span class="cat-title">${cat.name}</span>
              <span class="cat-badge">${cat.badge}</span>
            </div>
          </div>
        </div>
        <span class="cat-total-count">총 ${totalCasesInCat}개 사례</span>
      </div>
      <div class="category-items-list">
        ${renderPartButtons(cat)}
      </div>
    </div>
  `;
}

function renderCompactPartButtons(cat) {
  return cat.items.map(item => {
    const caseCount = item.caseIds ? item.caseIds.length : 0;
    return `
      <button class="compact-item-btn" onclick="selectSubitem('${cat.id}', '${item.id}')">
        <span class="compact-item-num">${item.num}</span>
        <span class="compact-item-name">${item.name}</span>
        <span class="compact-item-count">${caseCount}</span>
      </button>
    `;
  }).join("");
}

function renderCompactHome(container) {
  const cats = appState.activeCategoriesConfig;
  const openId = appState.openHomeCategoryId;
  const openCat = openId ? cats.find(c => c.id === openId) : null;

  if (openCat && !PRIMARY_CATEGORY_IDS.includes(openCat.id)) {
    container.innerHTML = `
      <div class="compact-parts-panel" style="--cat-color: ${openCat.color};">
        <button type="button" class="compact-back-btn" onclick="closeHomeCategory()">← 전체 항목</button>
        <div class="compact-parts-head">
          <span class="compact-parts-icon">${openCat.icon}</span>
          <div>
            <strong class="compact-parts-title">${openCat.name}</strong>
            <span class="compact-parts-count">총 ${countCategoryCases(openCat)}개 사례</span>
          </div>
        </div>
        <div class="compact-cat-items">
          ${renderCompactPartButtons(openCat)}
        </div>
      </div>
    `;
    return;
  }

  const primary = PRIMARY_CATEGORY_IDS.map(id => cats.find(c => c.id === id)).filter(Boolean);
  const secondary = cats.filter(c => !PRIMARY_CATEGORY_IDS.includes(c.id));

  container.innerHTML = `
    <div class="compact-home-grid">
      ${primary.map(cat => `
        <section class="compact-cat-card" style="--cat-color: ${cat.color};">
          <div class="compact-cat-head">
            <span class="compact-home-icon">${cat.icon}</span>
            <span class="compact-home-name">${cat.name}</span>
            <span class="compact-home-count">${countCategoryCases(cat)}</span>
          </div>
          <div class="compact-cat-items">
            ${renderCompactPartButtons(cat)}
          </div>
        </section>
      `).join("")}
    </div>
    <div class="compact-home-more">
      ${secondary.map(cat => `
        <button type="button" class="compact-home-chip" style="--cat-color: ${cat.color};" onclick="openHomeCategory('${cat.id}')">
          <span>${cat.icon} ${cat.name}</span>
          <span>${countCategoryCases(cat)}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function openHomeCategory(catId) {
  appState.openHomeCategoryId = catId;
  renderCategoryGrid();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeHomeCategory() {
  appState.openHomeCategoryId = null;
  renderCategoryGrid();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------- NAVIGATION CONTROLLER ---------------- */
function setActiveView(viewName) {
  appState.view = viewName;
  const homeView = document.getElementById("homeView");
  const partView = document.getElementById("partView");
  const caseView = document.getElementById("caseView");
  const navBackHomeBtn = document.getElementById("navBackHomeBtn");

  if (homeView) homeView.style.display = viewName === "home" ? "block" : "none";
  if (partView) partView.style.display = viewName === "part" ? "block" : "none";
  if (caseView) caseView.style.display = viewName === "case" ? "block" : "none";
  if (navBackHomeBtn) navBackHomeBtn.style.display = viewName === "home" ? "none" : "inline-flex";
  setCompactHomeClass(viewName === "home" && isCompactHome());
}

function selectSubitem(categoryId, subitemId) {
  openPartView(categoryId, subitemId);
}

function openPartView(categoryId, subitemId) {
  const category = appState.activeCategoriesConfig.find(c => c.id === categoryId);
  if (!category) return;
  const subitem = category.items.find(i => i.id === subitemId);
  if (!subitem) return;

  appState.currentCategoryId = categoryId;
  appState.currentSubitemId = subitemId;
  appState.currentCase = null;
  appState.currentPartPhotoIndex = 0;
  appState.zoomLevel = 1.0;

  setActiveView("part");
  cancelEditTitle();
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderPartView();
}

function openCaseView(categoryId, subitemId, caseIndex = 0) {
  const category = appState.activeCategoriesConfig.find(c => c.id === categoryId);
  if (!category) return;
  const subitem = category.items.find(i => i.id === subitemId);
  if (!subitem || !subitem.caseIds) return;

  if (subitem.caseIds.length === 0) {
    showToast(`'${subitem.name}' 항목에 등록된 사고 사례가 없습니다. 다른 항목에서 사례를 이동해 올 수 있습니다.`, "info");
    openPartView(categoryId, subitemId);
    return;
  }

  appState.currentCategoryId = categoryId;
  appState.currentSubitemId = subitemId;
  appState.currentCaseIndexInSubitem = Math.max(0, Math.min(caseIndex, subitem.caseIds.length - 1));

  setActiveView("case");
  cancelEditTitle();
  window.scrollTo({ top: 0, behavior: "smooth" });

  renderViewerTopBar(category, subitem);
  renderCaseDetail();
}

function goBackToPart() {
  if (appState.currentCategoryId && appState.currentSubitemId) {
    openPartView(appState.currentCategoryId, appState.currentSubitemId);
    return;
  }
  goHome();
}

function goHome() {
  appState.currentCategoryId = null;
  appState.currentSubitemId = null;
  appState.currentCase = null;
  appState.openHomeCategoryId = null;
  appState.zoomLevel = 1.0;

  setActiveView("home");
  cancelEditTitle();
  renderCategoryGrid();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderPartView() {
  const category = appState.activeCategoriesConfig.find(c => c.id === appState.currentCategoryId);
  const subitem = category ? category.items.find(i => i.id === appState.currentSubitemId) : null;
  if (!category || !subitem) return;

  const crumb = document.getElementById("partBreadcrumb");
  if (crumb) {
    crumb.innerHTML = `
      <span class="crumb-link" onclick="goHome()">전체 카테고리</span>
      <span class="crumb-sep">/</span>
      <span class="crumb-cat" style="color:${category.color};">${category.name}</span>
      <span class="crumb-sep">/</span>
      <span class="crumb-current">${subitem.num}. ${subitem.name}</span>
    `;
  }

  const kicker = document.getElementById("partViewKicker");
  const title = document.getElementById("partViewTitle");
  const desc = document.getElementById("partViewDesc");
  if (kicker) kicker.style.display = "none";
  if (title) title.textContent = `${subitem.name} 관련 사고사례`;
  if (desc) {
    desc.textContent = "";
    desc.style.display = "none";
  }

  renderPartPhoto();
  renderPartCaseList(subitem);
}

function renderPartCaseList(subitem) {
  const listEl = document.getElementById("partCaseList");
  if (!listEl) return;

  const caseIds = Array.isArray(subitem.caseIds) ? subitem.caseIds : [];
  if (caseIds.length === 0) {
    listEl.innerHTML = `<div class="part-case-empty">이 부품에 등록된 사고 사례가 없습니다. 다른 항목에서 사례를 이동해 올 수 있습니다.</div>`;
    return;
  }

  listEl.innerHTML = caseIds.map((caseId, idx) => {
    const caseData = CASES_DATA.find(c => c.id === caseId);
    const caseTitle = caseData ? getCaseTitle(caseData) : `사례 ${caseId}`;
    return `
      <button class="part-case-btn" onclick="openCaseView('${appState.currentCategoryId}', '${subitem.id}', ${idx})">
        <span class="part-case-num">${idx + 1}</span>
        <span class="part-case-title">${escapeHtml(caseTitle)}</span>
      </button>
    `;
  }).join("");
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizePhotoUrl(url) {
  const text = String(url || "");
  if (text.startsWith("data:")) return text;
  const noQuery = text.replace(/\?.*$/, "");
  if (noQuery.startsWith("/data/part_photos/")) return noQuery.slice(1);
  return noQuery;
}

function normalizePhotoEntry(entry) {
  if (!entry) return null;
  if (typeof entry === "string" && entry) {
    const url = normalizePhotoUrl(entry);
    const id = url.replace(/^.*\//, "").replace(/\.[a-zA-Z]+$/, "") || url;
    return { id, url };
  }
  if (typeof entry === "object" && entry.url) {
    const url = normalizePhotoUrl(entry.url);
    return {
      id: String(entry.id || url).replace(/^.*\//, "").replace(/\.[a-zA-Z]+$/, ""),
      url
    };
  }
  return null;
}

function normalizePartPhotos(raw) {
  const out = {};
  Object.keys(raw || {}).forEach((key) => {
    const value = raw[key];
    const list = Array.isArray(value) ? value : (value ? [value] : []);
    const normalized = list.map(normalizePhotoEntry).filter(Boolean);
    if (normalized.length) out[key] = uniquePartPhotos(normalized);
  });
  return out;
}

function uniquePartPhotos(list) {
  const seen = new Set();
  return (list || []).filter((item) => {
    const key = item.id || item.url;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergePartPhotoMaps(baseMap, extraMap) {
  const merged = normalizePartPhotos(baseMap);
  const extra = normalizePartPhotos(extraMap);
  Object.keys(extra).forEach((key) => {
    merged[key] = uniquePartPhotos([...(merged[key] || []), ...extra[key]]);
  });
  return merged;
}

function getPartPhotos(subitemId) {
  const list = appState.partPhotos[subitemId];
  return Array.isArray(list) ? list : [];
}

function renderPartPhoto() {
  const frame = document.getElementById("partPhotoFrame");
  const thumbs = document.getElementById("partPhotoThumbs");
  const removeBtn = document.getElementById("btnRemovePartPhoto");
  const attachLabel = document.getElementById("partPhotoAttachLabel");
  if (!frame) return;

  const photos = getPartPhotos(appState.currentSubitemId);
  if (appState.currentPartPhotoIndex >= photos.length) {
    appState.currentPartPhotoIndex = Math.max(0, photos.length - 1);
  }

  if (attachLabel) attachLabel.textContent = "사진 추가";

  if (!photos.length) {
    frame.classList.remove("has-photo");
    frame.innerHTML = `
      <div class="part-photo-empty">
        <span class="part-photo-empty-icon">📷</span>
        <strong>부품 사진이 없습니다</strong>
        <span>아래에서 바로 첨부하세요. 여러 장 넣을 수 있습니다.</span>
      </div>
    `;
    if (thumbs) thumbs.innerHTML = "";
    if (removeBtn) removeBtn.style.display = "none";
    return;
  }

  const current = photos[appState.currentPartPhotoIndex] || photos[0];
  frame.classList.add("has-photo");
  frame.innerHTML = `
    <button type="button" class="part-photo-open" onclick="openPartPhotoLightbox()" title="사진 전체화면으로 보기">
      <img src="${current.url}" alt="${escapeHtml(appState.currentSubitemId)} 부품 사진 ${appState.currentPartPhotoIndex + 1}" />
      <span class="part-photo-zoom-hint">눌러서 전체화면</span>
    </button>
  `;
  if (removeBtn) removeBtn.style.display = "inline-flex";

  if (thumbs) {
    thumbs.innerHTML = photos.map((photo, idx) => `
      <button type="button" class="part-photo-thumb ${idx === appState.currentPartPhotoIndex ? "active" : ""}" onclick="selectPartPhoto(${idx})" title="${idx + 1}번째 사진">
        <img src="${photo.url}" alt="${idx + 1}번째 부품 사진" />
        <span class="part-photo-thumb-num">${idx + 1}</span>
      </button>
    `).join("");
  }
}

function selectPartPhoto(index) {
  appState.currentPartPhotoIndex = index;
  renderPartPhoto();
}

function isPhotoLightboxOpen() {
  const overlay = document.getElementById("photoLightbox");
  return !!(overlay && overlay.classList.contains("is-open"));
}

function openPartPhotoLightbox(index) {
  const photos = getPartPhotos(appState.currentSubitemId);
  if (!photos.length) return;
  if (typeof index === "number") appState.currentPartPhotoIndex = index;

  const overlay = document.getElementById("photoLightbox");
  const img = document.getElementById("photoLightboxImg");
  const count = document.getElementById("photoLightboxCount");
  const prevBtn = document.getElementById("photoLightboxPrev");
  const nextBtn = document.getElementById("photoLightboxNext");
  const current = photos[appState.currentPartPhotoIndex] || photos[0];
  if (!overlay || !img || !current) return;

  img.src = current.url;
  if (count) count.textContent = `${appState.currentPartPhotoIndex + 1} / ${photos.length}`;
  if (prevBtn) prevBtn.style.display = photos.length > 1 ? "flex" : "none";
  if (nextBtn) nextBtn.style.display = photos.length > 1 ? "flex" : "none";
  overlay.hidden = false;
  overlay.classList.add("is-open");
  document.body.classList.add("photo-lightbox-open");
}

function closePartPhotoLightbox() {
  const overlay = document.getElementById("photoLightbox");
  if (overlay) {
    overlay.hidden = true;
    overlay.classList.remove("is-open");
  }
  document.body.classList.remove("photo-lightbox-open");
}

function navigatePartPhotoLightbox(delta) {
  const photos = getPartPhotos(appState.currentSubitemId);
  if (photos.length < 2) return;
  appState.currentPartPhotoIndex = (appState.currentPartPhotoIndex + delta + photos.length) % photos.length;
  renderPartPhoto();
  openPartPhotoLightbox();
}

function onPhotoLightboxBackdrop(event) {
  if (event.target && event.target.id === "photoLightbox") {
    closePartPhotoLightbox();
  }
}

async function onPartPhotoSelected(event) {
  const input = event.target;
  const files = input && input.files ? Array.from(input.files) : [];
  if (!files.length || !appState.currentSubitemId) return;

  const imageFiles = files.filter((file) => file.type.startsWith("image/"));
  if (!imageFiles.length) {
    showToast("이미지 파일만 첨부할 수 있습니다.", "error");
    input.value = "";
    return;
  }

  try {
    showToast(`${imageFiles.length}장을 첨부하는 중입니다...`, "info");
    const subitemId = appState.currentSubitemId;
    if (!Array.isArray(appState.partPhotos[subitemId])) appState.partPhotos[subitemId] = [];

    for (const file of imageFiles) {
      const dataUrl = await compressImageFile(file);
      const saved = await persistPartPhoto(subitemId, dataUrl);
      if (saved) appState.partPhotos[subitemId].push(saved);
    }

    appState.partPhotos[subitemId] = uniquePartPhotos(appState.partPhotos[subitemId]);
    appState.currentPartPhotoIndex = appState.partPhotos[subitemId].length - 1;
    await saveCustomData();
    renderPartPhoto();
    const savedLocally = (appState.partPhotos[subitemId] || []).some((photo) => String(photo.url || "").startsWith("data:"));
    if (savedLocally) {
      showToast("이 휴대폰에만 저장됐습니다. 다른 기기에는 아직 보이지 않습니다.", "info");
    } else {
      showToast(`부품 사진 ${imageFiles.length}장을 추가했습니다. 다른 기기는 잠시 후 새로고침하면 보입니다.`);
    }
  } catch (err) {
    console.warn(err);
    showToast("사진 첨부 중 오류가 발생했습니다.", "error");
  } finally {
    input.value = "";
  }
}

async function removeCurrentPartPhoto() {
  const photos = getPartPhotos(appState.currentSubitemId);
  const current = photos[appState.currentPartPhotoIndex];
  if (!current) return;

  const ok = confirm("지금 보고 있는 사진을 삭제할까요? 다른 사진은 그대로 남습니다.");
  if (!ok) return;

  const subitemId = appState.currentSubitemId;
  await deleteStoredPartPhoto(current.id);
  appState.partPhotos[subitemId] = photos.filter((photo) => photo.id !== current.id);
  if (!appState.partPhotos[subitemId].length) delete appState.partPhotos[subitemId];
  await saveCustomData();
  renderPartPhoto();
  showToast("선택한 사진을 삭제했습니다.", "info");
}

function compressImageFile(file, maxW = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("image load failed"));
    };
    img.src = objectUrl;
  });
}

function sanitizePartPhotosForSave(photos) {
  const clean = {};
  Object.keys(photos || {}).forEach((key) => {
    const list = getPartPhotos(key).filter((item) => item.url && !String(item.url).startsWith("data:"));
    if (list.length) clean[key] = list;
  });
  return clean;
}

function openPartPhotoDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("elevator_part_photos", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("photos")) {
        db.createObjectStore("photos");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbPutPartPhoto(subitemId, dataUrl) {
  const db = await openPartPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("photos", "readwrite");
    tx.objectStore("photos").put(dataUrl, subitemId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbGetPartPhoto(subitemId) {
  const db = await openPartPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("photos", "readonly");
    const req = tx.objectStore("photos").get(subitemId);
    req.onsuccess = () => resolve(req.result || "");
    req.onerror = () => reject(req.error);
  });
}

async function idbDeletePartPhoto(subitemId) {
  const db = await openPartPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("photos", "readwrite");
    tx.objectStore("photos").delete(subitemId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function makePhotoId(subitemId) {
  return `${subitemId}__${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function subitemIdFromPhotoId(photoId) {
  const text = String(photoId || "");
  const idx = text.indexOf("__");
  return idx === -1 ? text : text.slice(0, idx);
}

async function hydratePartPhotosFromIdb() {
  try {
    const db = await openPartPhotoDb();
    await new Promise((resolve) => {
      const tx = db.transaction("photos", "readonly");
      const req = tx.objectStore("photos").getAllKeys();
      req.onsuccess = async () => {
        const idbKeys = req.result || [];
        for (const key of idbKeys) {
          const dataUrl = await idbGetPartPhoto(key);
          if (!dataUrl) continue;
          const subitemId = subitemIdFromPhotoId(key);
          if (!Array.isArray(appState.partPhotos[subitemId])) appState.partPhotos[subitemId] = [];
          const exists = appState.partPhotos[subitemId].some((item) => item.id === key || item.url === dataUrl);
          if (!exists) appState.partPhotos[subitemId].push({ id: key, url: dataUrl });
        }
        resolve();
      };
      req.onerror = () => resolve();
    });
  } catch (e) {}
}

async function photoUploadEndpoints() {
  const endpoints = ["/api/part-photo"];
  try {
    const res = await fetch("data/sync_url.txt", { cache: "no-store" });
    if (res.ok) {
      const base = (await res.text()).trim().replace(/\/$/, "");
      if (/^https:\/\/[a-z0-9.-]+\.(?:lhr\.life|localhost\.run)$/i.test(base)) {
        endpoints.push(`${base}/api/part-photo`);
      }
    }
  } catch (e) {}
  return endpoints;
}

async function postPhotoToEndpoints(subitemId, dataUrl) {
  const endpoints = await photoUploadEndpoints();
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subitemId, dataUrl }),
        signal: AbortSignal.timeout(20000)
      });
      if (!res.ok) continue;
      const result = await res.json();
      if (result && result.url) {
        return {
          id: result.id || makePhotoId(subitemId),
          url: normalizePhotoUrl(result.url)
        };
      }
    } catch (e) {}
  }
  return null;
}

async function loadStaticSharedPhotos() {
  try {
    const res = await fetch("data/custom_data.json", { cache: "no-store" });
    if (!res.ok) return;
    const shared = await res.json();
    if (shared.partPhotos && typeof shared.partPhotos === "object") {
      appState.partPhotos = mergePartPhotoMaps(appState.partPhotos, normalizePartPhotos(shared.partPhotos));
    }
  } catch (e) {}
}

async function publishLocalOnlyPhotos() {
  let changed = false;
  const subitemIds = Object.keys(appState.partPhotos);
  for (const subitemId of subitemIds) {
    const list = appState.partPhotos[subitemId] || [];
    for (let i = 0; i < list.length; i++) {
      const photo = list[i];
      if (!photo || !String(photo.url || "").startsWith("data:")) continue;
      const saved = await postPhotoToEndpoints(subitemId, photo.url);
      if (!saved) continue;
      try { await idbDeletePartPhoto(photo.id); } catch (e) {}
      list[i] = saved;
      changed = true;
    }
    appState.partPhotos[subitemId] = uniquePartPhotos(list);
  }
  if (!changed) return;
  await saveCustomData();
  if (appState.view === "part") renderPartPhoto();
}

async function persistPartPhoto(subitemId, dataUrl) {
  const saved = await postPhotoToEndpoints(subitemId, dataUrl);
  if (saved) return saved;

  const photoId = makePhotoId(subitemId);
  await idbPutPartPhoto(photoId, dataUrl);
  return { id: photoId, url: dataUrl };
}

async function deleteStoredPartPhoto(photoId) {
  if (!photoId) return;
  try {
    await fetch(`/api/part-photo?id=${encodeURIComponent(photoId)}`, { method: "DELETE" });
  } catch (e) {}
  try {
    await idbDeletePartPhoto(photoId);
  } catch (e) {}
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
              onclick="openPartView('${category.id}', '${item.id}')">
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
  openCaseView(targetCat.id, targetSub.id, newIndex);
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

  if ((appState.view === "case" || appState.view === "part") && appState.currentCategoryId && appState.currentSubitemId) {
    openPartView(appState.currentCategoryId, appState.currentSubitemId);
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
    if (isPhotoLightboxOpen()) {
      if (e.key === "Escape") {
        e.preventDefault();
        closePartPhotoLightbox();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigatePartPhotoLightbox(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigatePartPhotoLightbox(1);
      }
      return;
    }

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

    if (appState.view === "part" && e.key === "Escape") {
      e.preventDefault();
      goHome();
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
      goBackToPart();
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

  const lightbox = document.getElementById("photoLightbox");
  if (lightbox) {
    let lightStartX = 0;
    let lightStartY = 0;
    lightbox.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      lightStartX = e.touches[0].clientX;
      lightStartY = e.touches[0].clientY;
    }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      if (!lightStartX || e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - lightStartX;
      const dy = e.changedTouches[0].clientY - lightStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        navigatePartPhotoLightbox(dx < 0 ? 1 : -1);
      }
      lightStartX = 0;
      lightStartY = 0;
    }, { passive: true });
  }
}
