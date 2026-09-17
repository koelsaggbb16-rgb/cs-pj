/**
 * 2024 승강기 사고 사례 분석 & 안전 포털 App Controller
 */

// Application State
const state = {
  activeElevatorFilter: "ALL",
  activeAccidentFilter: "ALL",
  activeCauseFilter: "ALL",
  searchQuery: "",
  currentCaseIndex: 0,
  filteredCases: [],
  zoomLevel: 1.0,
  currentModalType: "case", // 'case' | 'poster' | 'flood'
  theme: localStorage.getItem("theme") || "light"
};

// Initialize DOM elements
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderDashboard();
  renderFilters();
  applyFilters();
  renderPosters();
  renderFloodManual();
  setupEventListeners();
});

/* ---------------- THEME TOGGLE ---------------- */
function initTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  updateThemeIcon();
}

function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", state.theme);
  localStorage.setItem("theme", state.theme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.innerHTML = state.theme === "light" ? "🌙" : "☀️";
    btn.title = state.theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환";
  }
}

/* ---------------- DASHBOARD CHARTS ---------------- */
function renderDashboard() {
  // 1. By Cause
  const causeContainer = document.getElementById("statsByCause");
  if (causeContainer) {
    causeContainer.innerHTML = STATS_SUMMARY.byCause.map(item => `
      <div class="bar-item">
        <div class="bar-info">
          <span class="bar-name">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${item.color};"></span>
            ${item.name}
          </span>
          <span class="bar-val">${item.count}건 (${item.percent}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${item.percent}%; background-color: ${item.color};"></div>
        </div>
      </div>
    `).join("");
  }

  // 2. By Elevator Type
  const elevContainer = document.getElementById("statsByElevator");
  if (elevContainer) {
    elevContainer.innerHTML = STATS_SUMMARY.byElevatorType.map(item => `
      <div class="bar-item">
        <div class="bar-info">
          <span class="bar-name">${item.name}</span>
          <span class="bar-val">${item.count}건 (${item.percent}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${item.percent}%; background-color: var(--primary);"></div>
        </div>
      </div>
    `).join("");
  }

  // 3. By Accident Type
  const accidentContainer = document.getElementById("statsByAccidentType");
  if (accidentContainer) {
    accidentContainer.innerHTML = STATS_SUMMARY.byAccidentType.map(item => `
      <div class="bar-item">
        <div class="bar-info">
          <span class="bar-name">${item.name}</span>
          <span class="bar-val">${item.count}건 (${item.percent}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${item.percent}%; background-color: var(--accent);"></div>
        </div>
      </div>
    `).join("");
  }

  // 4. By Age Group
  const ageContainer = document.getElementById("statsByAge");
  if (ageContainer) {
    ageContainer.innerHTML = STATS_SUMMARY.byAgeGroup.map(item => `
      <div class="bar-item">
        <div class="bar-info">
          <span class="bar-name">${item.name}</span>
          <span class="bar-val">${item.count}명 (${item.percent}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${item.percent}%; background-color: var(--purple);"></div>
        </div>
      </div>
    `).join("");
  }
}

/* ---------------- FILTERING & SEARCH ---------------- */
function renderFilters() {
  // Elevators
  const elevFilters = [
    { label: "전체 기종", value: "ALL" },
    { label: "엘리베이터", value: "EL" },
    { label: "에스컬레이터", value: "ES" },
    { label: "수평보행기 (무빙워크)", value: "MW" }
  ];
  const elevWrap = document.getElementById("filterElevatorChips");
  if (elevWrap) {
    elevWrap.innerHTML = elevFilters.map(f => `
      <button class="filter-chip ${state.activeElevatorFilter === f.value ? 'active' : ''}" 
              onclick="setFilter('elevator', '${f.value}')">${f.label}</button>
    `).join("");
  }

  // Accident Types
  const accidentFilters = [
    { label: "전체 유형", value: "ALL" },
    { label: "전도 (넘어짐)", value: "전도" },
    { label: "추락", value: "추락" },
    { label: "끼임 / 협착", value: "끼임" },
    { label: "충돌", value: "충돌" }
  ];
  const accWrap = document.getElementById("filterAccidentChips");
  if (accWrap) {
    accWrap.innerHTML = accidentFilters.map(f => `
      <button class="filter-chip ${state.activeAccidentFilter === f.value ? 'active' : ''}" 
              onclick="setFilter('accident', '${f.value}')">${f.label}</button>
    `).join("");
  }

  // Cause
  const causeFilters = [
    { label: "전체 원인", value: "ALL" },
    { label: "이용자 과실", value: "이용자" },
    { label: "작업자 과실", value: "작업자" },
    { label: "관리주체 과실", value: "관리주체" },
    { label: "유지관리업체 과실", value: "유지관리" },
    { label: "기계 / 기타", value: "기타" }
  ];
  const causeWrap = document.getElementById("filterCauseChips");
  if (causeWrap) {
    causeWrap.innerHTML = causeFilters.map(f => `
      <button class="filter-chip ${state.activeCauseFilter === f.value ? 'active' : ''}" 
              onclick="setFilter('cause', '${f.value}')">${f.label}</button>
    `).join("");
  }
}

function setFilter(type, value) {
  if (type === "elevator") state.activeElevatorFilter = value;
  if (type === "accident") state.activeAccidentFilter = value;
  if (type === "cause") state.activeCauseFilter = value;
  renderFilters();
  applyFilters();
}

function resetAllFilters() {
  state.activeElevatorFilter = "ALL";
  state.activeAccidentFilter = "ALL";
  state.activeCauseFilter = "ALL";
  state.searchQuery = "";
  const input = document.getElementById("caseSearchInput");
  if (input) input.value = "";
  renderFilters();
  applyFilters();
}

function applyFilters() {
  state.filteredCases = CASES_DATA.filter(c => {
    // Elevator category filter
    if (state.activeElevatorFilter !== "ALL") {
      if (c.elevatorCategory !== state.activeElevatorFilter) return false;
    }

    // Accident type filter
    if (state.activeAccidentFilter !== "ALL") {
      if (!c.accidentType.includes(state.activeAccidentFilter)) return false;
    }

    // Cause filter
    if (state.activeCauseFilter !== "ALL") {
      if (!c.causeType.includes(state.activeCauseFilter)) return false;
    }

    // Search Query
    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase().trim();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchSummary = c.summary.toLowerCase().includes(q);
      const matchElev = c.elevatorType.toLowerCase().includes(q);
      const matchAcc = c.accidentType.toLowerCase().includes(q);
      const matchCause = c.causeType.toLowerCase().includes(q);
      const matchTags = c.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSummary && !matchElev && !matchAcc && !matchCause && !matchTags) {
        return false;
      }
    }

    return true;
  });

  renderCasesGrid();
  updateFilterMeta();
}

function updateFilterMeta() {
  const countEl = document.getElementById("caseResultCount");
  if (countEl) {
    countEl.innerHTML = `총 <span>${state.filteredCases.length}</span>건의 사고 사례`;
  }
}

/* ---------------- CASES GRID ---------------- */
function renderCasesGrid() {
  const container = document.getElementById("casesGrid");
  if (!container) return;

  if (state.filteredCases.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">일치하는 사고 사례가 없습니다</div>
        <div class="empty-desc">필터 조건을 재설정하거나 다른 검색어를 입력해 보세요.</div>
        <button class="filter-chip active" style="margin-top: 1rem;" onclick="resetAllFilters()">전체 필터 초기화</button>
      </div>
    `;
    return;
  }

  container.innerHTML = state.filteredCases.map((c, index) => {
    const isFatal = c.severity === "사망";
    return `
      <article class="case-card" onclick="openCaseModal(${c.id})">
        <div class="case-thumb-wrap">
          <img class="case-thumb-img" src="${c.image}" alt="${c.title}" loading="lazy" />
          <div class="thumb-tag-top">
            <span class="badge-case-id">사례 #${String(c.id).padStart(2, '0')}</span>
            <span class="badge-severity ${c.severity}">${c.severity}</span>
          </div>
          <div class="thumb-overlay">
            <span class="thumb-page-num">원문 도서 p.${c.bookPage}</span>
            <span class="click-hint">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
              상세 분석 보기
            </span>
          </div>
        </div>

        <div class="case-body">
          <div class="case-pills">
            <span class="pill pill-type">${c.elevatorType}</span>
            <span class="pill pill-accident">${c.accidentType}</span>
            <span class="pill pill-cause">${c.causeType}</span>
          </div>

          <h3 class="case-title">${c.title}</h3>
          <p class="case-summary-text">${c.summary}</p>

          <div class="case-footer">
            <span>유사 건수: <strong>${c.similarCount}</strong></span>
            <span class="case-action-btn">
              사고 내용·원인·대책
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/* ---------------- MODAL LIGHTBOX ---------------- */
function openCaseModal(caseId) {
  const caseObj = CASES_DATA.find(c => c.id === caseId);
  if (!caseObj) return;

  state.currentCaseIndex = CASES_DATA.findIndex(c => c.id === caseId);
  state.currentModalType = "case";
  state.zoomLevel = 1.0;

  renderCaseModalContent(caseObj);
  showModal();
}

function renderCaseModalContent(c) {
  // Title & Header
  document.getElementById("modalCategoryBadge").innerHTML = `
    <span>사례 #${String(c.id).padStart(2, '0')}</span> • 
    <span>${c.elevatorType}</span> • 
    <span class="badge-severity ${c.severity}">${c.severity}</span>
  `;
  document.getElementById("modalTitle").innerText = c.title;

  // Image side
  const imgEl = document.getElementById("modalDetailImg");
  imgEl.src = c.image;
  imgEl.alt = c.title;
  imgEl.style.transform = `scale(1)`;
  document.getElementById("modalPageIndicator").innerText = `도서 p.${c.bookPage} (원문 이미지)`;

  // Info side: Table
  document.getElementById("modalInfoTable").innerHTML = `
    <div class="info-item">
      <span class="info-item-label">승강기 종류</span>
      <span class="info-item-value">${c.elevatorType} (${c.elevatorCategory})</span>
    </div>
    <div class="info-item">
      <span class="info-item-label">사고 유형 / 피해</span>
      <span class="info-item-value">${c.accidentType} (${c.casualty})</span>
    </div>
    <div class="info-item">
      <span class="info-item-label">사고 대표 원인</span>
      <span class="info-item-value">${c.causeType}</span>
    </div>
    <div class="info-item">
      <span class="info-item-label">동일 유사 사고 건수</span>
      <span class="info-item-value">${c.similarCount}</span>
    </div>
  `;

  // Info side: 가. 사고 내용
  document.getElementById("modalCaseDescription").innerHTML = c.description.map(d => `<li>${d}</li>`).join("");

  // Info side: 나. 발생 원인
  document.getElementById("modalCaseCause").innerHTML = c.cause.map(cause => `<li>${cause}</li>`).join("");

  // Info side: 다. 재발 방지 대책
  document.getElementById("modalCasePrevention").innerHTML = c.prevention.map(p => `<li>${p}</li>`).join("");

  // Navigation buttons
  const prevBtn = document.getElementById("modalPrevBtn");
  const nextBtn = document.getElementById("modalNextBtn");
  if (prevBtn) prevBtn.disabled = state.currentCaseIndex <= 0;
  if (nextBtn) nextBtn.disabled = state.currentCaseIndex >= CASES_DATA.length - 1;
}

function prevCase() {
  if (state.currentCaseIndex > 0) {
    state.currentCaseIndex--;
    state.zoomLevel = 1.0;
    renderCaseModalContent(CASES_DATA[state.currentCaseIndex]);
  }
}

function nextCase() {
  if (state.currentCaseIndex < CASES_DATA.length - 1) {
    state.currentCaseIndex++;
    state.zoomLevel = 1.0;
    renderCaseModalContent(CASES_DATA[state.currentCaseIndex]);
  }
}

function showModal() {
  const modal = document.getElementById("caseModal");
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeModal() {
  const modal = document.getElementById("caseModal");
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

// Image Zoom Controls
function zoomInModalImg() {
  state.zoomLevel = Math.min(state.zoomLevel + 0.25, 2.5);
  updateModalImgZoom();
}

function zoomOutModalImg() {
  state.zoomLevel = Math.max(state.zoomLevel - 0.25, 0.75);
  updateModalImgZoom();
}

function resetModalImgZoom() {
  state.zoomLevel = 1.0;
  updateModalImgZoom();
}

function updateModalImgZoom() {
  const imgEl = document.getElementById("modalDetailImg");
  if (imgEl) {
    imgEl.style.transform = `scale(${state.zoomLevel})`;
  }
}

function openImgNewTab() {
  const imgEl = document.getElementById("modalDetailImg");
  if (imgEl && imgEl.src) {
    window.open(imgEl.src, "_blank");
  }
}

/* ---------------- POSTERS (CHAPTER 5) ---------------- */
function renderPosters() {
  const container = document.getElementById("postersGrid");
  if (!container) return;

  container.innerHTML = POSTERS_DATA.map(p => `
    <article class="poster-card" onclick="openPosterModal(${p.id})">
      <div class="poster-thumb-wrap">
        <img class="poster-thumb-img" src="${p.image}" alt="${p.title}" loading="lazy" />
      </div>
      <div class="poster-info">
        <div class="poster-cat">${p.category}</div>
        <h4 class="poster-title">${p.title}</h4>
      </div>
    </article>
  `).join("");
}

function openPosterModal(posterId) {
  const poster = POSTERS_DATA.find(p => p.id === posterId);
  if (!poster) return;

  // Re-use modal container
  document.getElementById("modalCategoryBadge").innerHTML = `
    <span>제5장 사고·고장 예방 안내문</span> • 
    <span class="pill pill-type">${poster.category}</span>
  `;
  document.getElementById("modalTitle").innerText = poster.title;

  const imgEl = document.getElementById("modalDetailImg");
  imgEl.src = poster.image;
  imgEl.alt = poster.title;
  imgEl.style.transform = "scale(1)";
  document.getElementById("modalPageIndicator").innerText = `도서 p.${poster.bookPage} (안내문 전문)`;

  document.getElementById("modalInfoTable").innerHTML = `
    <div class="info-item" style="grid-column: 1 / -1;">
      <span class="info-item-label">구분</span>
      <span class="info-item-value">한국승강기안전공단 공식 예방 포스터 및 기술 기준 안내문</span>
    </div>
  `;

  document.getElementById("modalCaseDescription").innerHTML = `
    <li>본 자료는 현장 관리주체 및 승강기 유지관리 기술자를 위한 핵심 재해예방 안전 지침 포스터입니다.</li>
    <li>좌측 원본 이미지를 확대하여 세부 수칙 및 기술 권고사항을 확인하실 수 있습니다.</li>
  `;
  document.getElementById("modalCaseCause").innerHTML = `<li>동일 유형의 중대사고 및 고장 예방을 위한 핵심 체크포인트 안내</li>`;
  document.getElementById("modalCasePrevention").innerHTML = `<li>사업장 및 시설 내 승강장 주변 게시 또는 작업 전 안전점검 TBM 자료로 활용</li>`;

  document.getElementById("modalPrevBtn").disabled = true;
  document.getElementById("modalNextBtn").disabled = true;

  showModal();
}

/* ---------------- FLOOD GUIDELINES (CHAPTER 6) ---------------- */
function renderFloodManual() {
  const container = document.getElementById("floodStepsList");
  if (!container) return;

  container.innerHTML = FLOOD_GUIDELINES.map(item => `
    <div class="flood-step-row">
      <div class="flood-img-wrap" onclick="viewFloodImage('${item.image}', '${item.title}', ${item.bookPage})">
        <img src="${item.image}" alt="${item.title}" loading="lazy" />
        <div class="thumb-overlay">
          <span class="click-hint">매뉴얼 도서 p.${item.bookPage} 보기</span>
        </div>
      </div>
      <div class="flood-content">
        <div class="flood-step-badge">${item.step}</div>
        <h3 class="flood-title">${item.title}</h3>
        <ul class="flood-points">
          ${item.points.map(pt => `<li>${pt}</li>`).join("")}
        </ul>
      </div>
    </div>
  `).join("");
}

function viewFloodImage(imgSrc, title, bookPage) {
  document.getElementById("modalCategoryBadge").innerHTML = `
    <span>제6장 엘리베이터 침수상황 대응요령</span>
  `;
  document.getElementById("modalTitle").innerText = title;

  const imgEl = document.getElementById("modalDetailImg");
  imgEl.src = imgSrc;
  imgEl.alt = title;
  imgEl.style.transform = "scale(1)";
  document.getElementById("modalPageIndicator").innerText = `도서 p.${bookPage} (침수 대응 매뉴얼)`;

  document.getElementById("modalInfoTable").innerHTML = `
    <div class="info-item" style="grid-column: 1 / -1;">
      <span class="info-item-label">적용 대상</span>
      <span class="info-item-value">관리주체, 안전관리자, 입주민 및 시설 유지관리팀</span>
    </div>
  `;

  document.getElementById("modalCaseDescription").innerHTML = `<li>태풍, 집중호우 시 승강로 피트 침수 및 전기 단락 사고 예방 가이드라인</li>`;
  document.getElementById("modalCaseCause").innerHTML = `<li>지하층 빗물 유입으로 인한 카 하부 완충기, 조속기 풀리 부식 및 모터 단락 위험</li>`;
  document.getElementById("modalCasePrevention").innerHTML = `<li>침수 위험 시 즉시 승객 대피 후 카를 최상층으로 이동 주차 및 주전원 차단</li>`;

  document.getElementById("modalPrevBtn").disabled = true;
  document.getElementById("modalNextBtn").disabled = true;

  showModal();
}

/* ---------------- EVENT LISTENERS & SHORTCUTS ---------------- */
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById("caseSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      applyFilters();
    });
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Focus search with '/'
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        window.scrollTo({ top: searchInput.offsetTop - 100, behavior: "smooth" });
      }
    }

    // Modal navigation
    const modal = document.getElementById("caseModal");
    if (modal && modal.classList.contains("open")) {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft") {
        prevCase();
      } else if (e.key === "ArrowRight") {
        nextCase();
      }
    }
  });

  // Modal backdrop click
  const modalBackdrop = document.getElementById("caseModal");
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }
}
