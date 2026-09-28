/**
 * 2020~2024 승강기 사고 사례 종합 분석 & 안전 포털 App Controller
 * 한국승강기안전공단(KoELSA) 공식 4개년(2020, 2021, 2022, 2023년 발생) 총 183건 사례 통합
 */

// Application State
const state = {
  activeYearFilter: "ALL",        // 'ALL' | '2024' | '2023' | '2022' | '2020'
  activeElevatorFilter: "ALL",    // 'ALL' | 'EL' | 'ES' | 'MW'
  activeAccidentFilter: "ALL",    // 'ALL' | '전도' | '추락' | '끼임' | '충돌'
  activeCauseFilter: "ALL",       // 'ALL' | '이용자' | '작업자' | '관리주체' | '유지관리' | '기타'
  activePosterYearFilter: "ALL",  // 'ALL' | '2024' | '2023' | '2022'
  activePartFilter: "ALL",        // 'ALL' | 'EL' | 'ES'
  searchQuery: "",
  currentCaseIndex: 0,
  filteredCases: [],
  zoomLevel: 1.0,
  currentModalType: "case", // 'case' | 'poster' | 'flood'
  theme: localStorage.getItem("theme") || "light",
  currentBriefingPartId: null,
  currentMoveCaseId: null,
  currentMoveSourcePartId: null,
  addCaseSearchQuery: ""
};

// Initialize DOM elements
document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initPartMappings();
  initCustomTitles();
  await initCustomImages();
  renderYearTabs();
  renderTrendSection();
  renderPartsSection();
  updateDashboardAndKPIs();
  renderFilters();
  applyFilters();
  renderPosters();
  renderFloodManual();
  setupEventListeners();
  setupImageDragAndDrop();
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

/* ---------------- YEAR TABS NAVIGATION ---------------- */
const YEAR_TAB_DEFINITIONS = [
  { year: "ALL", label: "전체 4개년 통합", count: 183, sub: "2020~2024 통합" },
  { year: "2024", label: "2024 사례집", count: 26, sub: "2023년 발생 사고" },
  { year: "2023", label: "2023 사례집", count: 30, sub: "2022년 발생 사고" },
  { year: "2022", label: "2022 사례집", count: 41, sub: "2021년 발생 사고" },
  { year: "2020", label: "2020 사례집", count: 86, sub: "2020년 발생 사고" }
];

function renderYearTabs() {
  const container = document.getElementById("yearTabsList");
  if (!container) return;

  container.innerHTML = YEAR_TAB_DEFINITIONS.map(t => `
    <button class="year-tab-btn ${state.activeYearFilter === t.year ? 'active' : ''}"
            onclick="selectYear('${t.year}')"
            title="${t.sub}">
      <span>${t.label}</span>
      <span class="tab-count">${t.count}건</span>
    </button>
  `).join("");
}

function selectYear(year) {
  state.activeYearFilter = year;
  renderYearTabs();
  renderFilters();
  updateDashboardAndKPIs();
  applyFilters();

  // Scroll smoothly to dashboard if triggered from lower sections
  const dashEl = document.getElementById("dashboard");
  if (dashEl && window.scrollY > dashEl.offsetTop + 400) {
    dashEl.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ---------------- DYNAMIC HERO KPIS ---------------- */
function updateHeroKPIs(year) {
  const kpiTitle = document.getElementById("heroAccidentTitle");
  const kpiVal = document.getElementById("heroAccidentVal");
  const kpiSub = document.getElementById("heroAccidentSub");
  const kpiCasualtyVal = document.getElementById("heroCasualtyVal");
  const kpiCasualtySub = document.getElementById("heroCasualtySub");
  const kpiFleetVal = document.getElementById("heroFleetVal");
  const kpiFleetSub = document.getElementById("heroFleetSub");
  const kpiCauseVal = document.getElementById("heroCauseVal");
  const kpiCauseSub = document.getElementById("heroCauseSub");

  const stat = STATS_BY_YEAR[year] || STATS_BY_YEAR["ALL"];

  if (kpiVal) {
    if (year === "ALL") {
      if (kpiTitle) kpiTitle.innerText = "4개년 누적 중대 사고";
      kpiVal.innerHTML = `${stat.totalAccidents} <span class="stat-unit">건</span>`;
      if (kpiSub) kpiSub.innerText = "4개년 연평균 64.5건 (86건 → 42건 급감 ↓)";
      if (kpiCasualtyVal) kpiCasualtyVal.innerHTML = `${stat.totalCasualties} <span class="stat-unit">명</span>`;
      if (kpiCasualtySub) kpiCasualtySub.innerText = `사망 ${stat.fatalities}명 • 중상 ${stat.severeInjuries}명 (총 183건 사례 상세 수록)`;
      if (kpiFleetVal) kpiFleetVal.innerHTML = `84 <span class="stat-unit">만 대</span>`;
      if (kpiFleetSub) kpiFleetSub.innerText = "1만 대당 사고율 1.15건 → 0.50건 (-56.5% 개선)";
      if (kpiCauseVal) kpiCauseVal.innerHTML = `45.7 <span class="stat-unit">%</span>`;
      if (kpiCauseSub) kpiCauseSub.innerText = "이용자 과실 118건 최다 (손잡이/안전선)";
    } else {
      const yrName = stat.year;
      if (kpiTitle) kpiTitle.innerText = `${yrName} 중대 사고`;
      kpiVal.innerHTML = `${stat.totalAccidents} <span class="stat-unit">건</span>`;
      
      let deltaTxt = "";
      if (year === "2024") deltaTxt = "전년(55건) 대비 23.6% 감소 ↓";
      else if (year === "2023") deltaTxt = "전년(75건) 대비 26.7% 감소 ↓";
      else if (year === "2022") deltaTxt = "전년(86건) 대비 12.8% 감소 ↓";
      else deltaTxt = "2020년 발생 전국 중대사고 86건";
      if (kpiSub) kpiSub.innerText = deltaTxt;

      if (kpiCasualtyVal) kpiCasualtyVal.innerHTML = `${stat.totalCasualties} <span class="stat-unit">명</span>`;
      if (kpiCasualtySub) kpiCasualtySub.innerText = `사망 ${stat.fatalities}명 • 중상 ${stat.severeInjuries}명 (사례집 ${stat.caseCount}건 수록)`;

      const fleetTenK = Math.round(stat.elevatorFleet / 10000);
      if (kpiFleetVal) kpiFleetVal.innerHTML = `${fleetTenK} <span class="stat-unit">만 대</span>`;
      if (kpiFleetSub) kpiFleetSub.innerText = `1만 대당 사고율 ${stat.accidentRatePer10k}건`;

      const topCause = stat.byCause[0] || { percent: 45.2, name: "이용자 과실", count: 19 };
      if (kpiCauseVal) kpiCauseVal.innerHTML = `${topCause.percent} <span class="stat-unit">%</span>`;
      if (kpiCauseSub) kpiCauseSub.innerText = `${topCause.name} ${topCause.count}건 (1위)`;
    }
  }
}

/* ---------------- 4-YEAR TREND SECTION ---------------- */
function renderTrendSection() {
  const container = document.getElementById("trendCardsGrid");
  if (!container) return;

  const cardsHtml = FOUR_YEAR_TREND.map((t, idx) => {
    const isLatest = idx === FOUR_YEAR_TREND.length - 1;
    const prev = idx > 0 ? FOUR_YEAR_TREND[idx - 1] : null;
    let deltaHtml = "";
    if (prev) {
      const change = ((t.accidents - prev.accidents) / prev.accidents * 100).toFixed(1);
      const isGood = t.accidents < prev.accidents;
      deltaHtml = `<div class="trend-delta ${isGood ? 'down' : 'up'}">${isGood ? '▼' : '▲'} ${Math.abs(change)}% 전년 대비</div>`;
    } else {
      deltaHtml = `<div class="trend-delta down">기준 연도 (출발점)</div>`;
    }

    return `
      <div class="trend-card ${isLatest ? 'highlight' : ''}">
        <div class="trend-card-top">
          <span class="trend-year-label">${t.year} 발생</span>
          <span class="trend-year-badge">${t.fleet ? Math.round(t.fleet / 10000) + '만대 운행' : ''}</span>
        </div>
        <div class="trend-main-metric">
          <div class="trend-val">${t.accidents} <span class="trend-unit">건</span></div>
          ${deltaHtml}
        </div>
        <div class="trend-sub-list">
          <div class="trend-sub-row">
            <span>인명 피해</span>
            <strong>${t.casualties}명 (사망 ${t.fatalities})</strong>
          </div>
          <div class="trend-sub-row">
            <span>1만대당 사고율</span>
            <strong>${t.rate}건</strong>
          </div>
          <div class="trend-sub-row">
            <span>이용자 과실</span>
            <strong>${t.userFault}건</strong>
          </div>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = cardsHtml;
}

/* ---------------- DASHBOARD CHARTS ---------------- */
function updateDashboardAndKPIs() {
  const currentStat = STATS_BY_YEAR[state.activeYearFilter] || STATS_BY_YEAR["ALL"];
  
  // Update Hero KPI metrics
  updateHeroKPIs(state.activeYearFilter);

  // Update section badge and titles
  const dashBadge = document.getElementById("dashboardYearBadge");
  if (dashBadge) {
    dashBadge.innerText = currentStat.label;
  }

  const causeBadge = document.getElementById("badgeStatsByCause");
  if (causeBadge) {
    causeBadge.innerText = `총 ${currentStat.totalAccidents}건`;
  }

  // 1. By Cause
  const causeContainer = document.getElementById("statsByCause");
  if (causeContainer && currentStat.byCause) {
    causeContainer.innerHTML = currentStat.byCause.map(item => `
      <div class="bar-item">
        <div class="bar-info">
          <span class="bar-name">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${item.color || '#3b82f6'};"></span>
            ${item.name}
          </span>
          <span class="bar-val">${item.count}건 (${item.percent}%)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${item.percent}%; background-color: ${item.color || '#3b82f6'};"></div>
        </div>
      </div>
    `).join("");
  }

  // 2. By Elevator Type
  const elevContainer = document.getElementById("statsByElevator");
  if (elevContainer && currentStat.byElevatorType) {
    elevContainer.innerHTML = currentStat.byElevatorType.map(item => `
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
  if (accidentContainer && currentStat.byAccidentType) {
    accidentContainer.innerHTML = currentStat.byAccidentType.map(item => `
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
  if (ageContainer && currentStat.byAgeGroup) {
    ageContainer.innerHTML = currentStat.byAgeGroup.map(item => `
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
  // Year Chips
  const yearChips = [
    { label: "전체 연도 (183건)", value: "ALL" },
    { label: "2024 사례집 (26건)", value: "2024" },
    { label: "2023 사례집 (30건)", value: "2023" },
    { label: "2022 사례집 (41건)", value: "2022" },
    { label: "2020 사례집 (86건)", value: "2020" }
  ];
  const yearWrap = document.getElementById("filterYearChips");
  if (yearWrap) {
    yearWrap.innerHTML = yearChips.map(f => `
      <button class="filter-chip ${state.activeYearFilter === f.value ? 'active' : ''}"
              onclick="setFilter('year', '${f.value}')">${f.label}</button>
    `).join("");
  }

  // Elevators
  const elevFilters = [
    { label: "전체 기종", value: "ALL" },
    { label: "엘리베이터", value: "EL" },
    { label: "에스컬레이터", value: "ES" },
    { label: "무빙워크", value: "MW" }
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
    { label: "충돌", value: "충돌" },
    { label: "갇힘 / 운행이상", value: "갇힘" }
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
  if (type === "year") {
    state.activeYearFilter = value;
    renderYearTabs();
    updateDashboardAndKPIs();
  }
  if (type === "elevator") state.activeElevatorFilter = value;
  if (type === "accident") state.activeAccidentFilter = value;
  if (type === "cause") state.activeCauseFilter = value;

  renderFilters();
  applyFilters();
}

function resetAllFilters() {
  state.activeYearFilter = "ALL";
  state.activeElevatorFilter = "ALL";
  state.activeAccidentFilter = "ALL";
  state.activeCauseFilter = "ALL";
  state.searchQuery = "";
  const input = document.getElementById("caseSearchInput");
  if (input) input.value = "";
  
  renderYearTabs();
  renderFilters();
  updateDashboardAndKPIs();
  applyFilters();
}

function applyFilters() {
  state.filteredCases = CASES_DATA.filter(c => {
    // Year filter
    if (state.activeYearFilter !== "ALL") {
      if (String(c.bookYear) !== String(state.activeYearFilter)) return false;
    }

    // Elevator category filter
    if (state.activeElevatorFilter !== "ALL") {
      if (state.activeElevatorFilter === "MW") {
        if (!c.elevatorType.includes("무빙") && c.elevatorCategory !== "MW") return false;
      } else {
        if (c.elevatorCategory !== state.activeElevatorFilter && !c.elevatorType.includes(state.activeElevatorFilter === "EL" ? "엘리베" : "에스컬")) {
          return false;
        }
      }
    }

    // Accident type filter
    if (state.activeAccidentFilter !== "ALL") {
      if (!c.accidentType.includes(state.activeAccidentFilter) && !c.title.includes(state.activeAccidentFilter)) {
        return false;
      }
    }

    // Cause filter
    if (state.activeCauseFilter !== "ALL") {
      if (!c.causeType.includes(state.activeCauseFilter)) return false;
    }

    // Search Query
    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase().trim();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchSummary = (c.summary || "").toLowerCase().includes(q);
      const matchElev = c.elevatorType.toLowerCase().includes(q);
      const matchAcc = c.accidentType.toLowerCase().includes(q);
      const matchCause = c.causeType.toLowerCase().includes(q);
      const matchTags = c.tags ? c.tags.some(t => t.toLowerCase().includes(q)) : false;
      const matchYear = String(c.bookYear).includes(q) || String(c.accidentYear).includes(q);
      const matchDesc = c.description ? c.description.some(d => d.toLowerCase().includes(q)) : false;

      if (!matchTitle && !matchSummary && !matchElev && !matchAcc && !matchCause && !matchTags && !matchYear && !matchDesc) {
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
    const totalCount = CASES_DATA.length;
    const yearLabel = state.activeYearFilter === "ALL" ? "전체 4개년" : `${state.activeYearFilter} 사례집`;
    countEl.innerHTML = `${yearLabel} 중 <span>${state.filteredCases.length}</span>건 (전체 ${totalCount}건)`;
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
    const yearBadgeClass = `badge-year-${c.bookYear}`;
    const customImgBadge = c.customImage 
      ? `<span class="badge-severity" style="background:#059669; color:white; border-color:#10b981;" title="사용자 등록 실제 사진">📷 실사</span>` 
      : "";
    return `
      <article class="case-card" onclick="openCaseModal(${c.id})">
        <div class="case-thumb-wrap">
          <img class="case-thumb-img" src="${c.customImage || c.image}" alt="${c.title}" loading="lazy" />
          <div class="thumb-tag-top">
            <span class="badge-year ${yearBadgeClass}">${c.bookYear} 사례집</span>
            <span class="badge-case-id">#${String(c.caseId || c.id)}</span>
            <span class="badge-severity ${c.severity}">${c.severity}</span>
            ${customImgBadge}
          </div>
          <div class="thumb-overlay">
            <span class="thumb-page-num">${c.yearBadge || (c.bookYear + '년')} • p.${c.bookPage || c.page}</span>
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

          <h3 class="case-title">${c.customTitle || c.title}</h3>
          <p class="case-summary-text">${c.summary}</p>

          <div class="case-footer">
            <span>유사 건수: <strong>${c.similarCount || '-'}</strong></span>
            <span class="case-action-btn">
              사고 원인·대책 전문
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

  state.currentCaseIndex = state.filteredCases.findIndex(c => c.id === caseId);
  if (state.currentCaseIndex === -1) {
    state.currentCaseIndex = CASES_DATA.findIndex(c => c.id === caseId);
  }
  state.currentModalType = "case";
  state.zoomLevel = 1.0;

  renderCaseModalContent(caseObj);
  showModal();
}

function renderCaseModalContent(c) {
  state.currentViewingCaseId = c.id;
  // Title & Header
  document.getElementById("modalCategoryBadge").innerHTML = `
    <span class="badge-year badge-year-${c.bookYear}">${c.bookYear}년 발간</span>
    <span>#${c.caseId || c.id}</span> • 
    <span>${c.elevatorType}</span> • 
    <span class="badge-severity ${c.severity}">${c.severity}</span>
  `;
  document.getElementById("modalTitle").innerText = c.customTitle || c.title;
  const btnResetCaseTitle = document.getElementById("btnResetCaseTitle");
  if (btnResetCaseTitle) btnResetCaseTitle.style.display = c.customTitle ? "inline-flex" : "none";

  // Image side
  const imgEl = document.getElementById("modalDetailImg");
  imgEl.src = c.customImage || c.image;
  imgEl.alt = c.title;
  imgEl.style.transform = `scale(1)`;

  const badgeCustom = document.getElementById("modalCustomImgBadge");
  const btnReset = document.getElementById("btnResetCaseImg");
  if (c.customImage) {
    if (badgeCustom) badgeCustom.style.display = "flex";
    if (btnReset) btnReset.style.display = "inline-flex";
    document.getElementById("modalPageIndicator").innerText = `사용자 등록 실제 사진 (도서 원문 p.${c.bookPage || c.page})`;
  } else {
    if (badgeCustom) badgeCustom.style.display = "none";
    if (btnReset) btnReset.style.display = "none";
    document.getElementById("modalPageIndicator").innerText = `${c.yearBadge || (c.bookYear + '년 사례집')} 원문 p.${c.bookPage || c.page}`;
  }

  // Info side: Table
  const linkedParts = getLinkedPartsForCase(c.id);
  let linkedPartHtml = "";
  if (linkedParts.length > 0) {
    linkedPartHtml = linkedParts.map(p => `
      <span style="display:inline-flex; align-items:center; gap:0.25rem; background:rgba(37,99,235,0.12); color:#2563eb; padding:2px 8px; border-radius:4px; font-weight:700; font-size:0.8rem;">
        ${p.icon} ${p.name}
      </span>
    `).join(" ");
  } else {
    linkedPartHtml = `<span style="color:var(--text-muted); font-size:0.8rem;">연계된 핵심 부품 없음</span>`;
  }

  document.getElementById("modalInfoTable").innerHTML = `
    <div class="info-item">
      <span class="info-item-label">승강기 종류</span>
      <span class="info-item-value">${c.elevatorType}</span>
    </div>
    <div class="info-item">
      <span class="info-item-label">사고 유형 / 피해</span>
      <span class="info-item-value">${c.accidentType} (${c.casualty || c.severity})</span>
    </div>
    <div class="info-item">
      <span class="info-item-label">사고 대표 원인</span>
      <span class="info-item-value">${c.causeType}</span>
    </div>
    <div class="info-item">
      <span class="info-item-label">발간 및 발생 연도</span>
      <span class="info-item-value">${c.bookYear}년 발간 (${c.accidentYear}년 발생)</span>
    </div>
    <div class="info-item" style="grid-column: 1 / -1; background: rgba(37, 99, 235, 0.05); border: 1px dashed rgba(37, 99, 235, 0.3); border-radius: var(--radius-sm); padding: 0.5rem 0.75rem;">
      <span class="info-item-label" style="color: var(--primary); font-weight: 700;">연계 핵심 부품</span>
      <div class="info-item-value" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
        <div>${linkedPartHtml}</div>
        <button class="btn-change-part-badge" onclick="openMoveCaseFromDetailModal(${c.id})">
          ⇄ 부품 변경/이동
        </button>
      </div>
    </div>
  `;

  // Info side: 가. 사고 내용
  const descHtml = (c.description && c.description.length > 0)
    ? c.description.map(d => `<li>${d}</li>`).join("")
    : `<li>${c.summary || c.title}</li>`;
  document.getElementById("modalCaseDescription").innerHTML = descHtml;

  // Info side: 나. 발생 원인
  const causeHtml = (c.cause && c.cause.length > 0)
    ? c.cause.map(cause => `<li>${cause}</li>`).join("")
    : `<li>원인 분석 자료 확인 중</li>`;
  document.getElementById("modalCaseCause").innerHTML = causeHtml;

  // Info side: 다. 재발 방지 대책
  const prevHtml = (c.prevention && c.prevention.length > 0)
    ? c.prevention.map(p => `<li>${p}</li>`).join("")
    : `<li>승강기 안전관리 수칙 준수 및 주기적인 자체점검 강화</li>`;
  document.getElementById("modalCasePrevention").innerHTML = prevHtml;

  // Navigation buttons
  const prevBtn = document.getElementById("modalPrevBtn");
  const nextBtn = document.getElementById("modalNextBtn");
  const navList = state.filteredCases.length > 0 ? state.filteredCases : CASES_DATA;
  if (prevBtn) prevBtn.disabled = state.currentCaseIndex <= 0;
  if (nextBtn) nextBtn.disabled = state.currentCaseIndex >= navList.length - 1;
}

function prevCase() {
  const navList = state.filteredCases.length > 0 ? state.filteredCases : CASES_DATA;
  if (state.currentCaseIndex > 0) {
    state.currentCaseIndex--;
    state.zoomLevel = 1.0;
    renderCaseModalContent(navList[state.currentCaseIndex]);
  }
}

function nextCase() {
  const navList = state.filteredCases.length > 0 ? state.filteredCases : CASES_DATA;
  if (state.currentCaseIndex < navList.length - 1) {
    state.currentCaseIndex++;
    state.zoomLevel = 1.0;
    renderCaseModalContent(navList[state.currentCaseIndex]);
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
  const img = document.getElementById("modalDetailImg");
  if (img) {
    img.style.transform = `scale(${state.zoomLevel})`;
  }
}

function openImgNewTab() {
  const imgEl = document.getElementById("modalDetailImg");
  if (imgEl && imgEl.src) {
    window.open(imgEl.src, "_blank");
  }
}

/* ---------------- POSTERS GALLERY ---------------- */
function setPosterFilter(year) {
  state.activePosterYearFilter = year;
  renderPosters();
}

function renderPosters() {
  const container = document.getElementById("postersGrid");
  if (!container) return;

  const posters = POSTERS_DATA.filter(p => {
    if (state.activePosterYearFilter === "ALL") return true;
    return String(p.year) === String(state.activePosterYearFilter);
  });

  container.innerHTML = posters.map(p => `
    <article class="poster-card" onclick="openPosterModal(${p.id})">
      <div class="poster-thumb-wrap">
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
        <div class="thumb-overlay">
          <span class="click-hint">도서 p.${p.bookPage} 원본 보기</span>
        </div>
      </div>
      <div class="poster-info">
        <div class="poster-cat">${p.yearLabel || (p.year + ' 발간')} • ${p.category}</div>
        <h4 class="poster-title">${p.title}</h4>
      </div>
    </article>
  `).join("");
}

function openPosterModal(posterId) {
  const poster = POSTERS_DATA.find(p => p.id === posterId);
  if (!poster) return;

  document.getElementById("modalCategoryBadge").innerHTML = `
    <span class="badge-year badge-year-${poster.year}">${poster.yearLabel || (poster.year + ' 발간')}</span> • 
    <span class="pill pill-type">${poster.category}</span>
  `;
  document.getElementById("modalTitle").innerText = poster.title;

  const imgEl = document.getElementById("modalDetailImg");
  imgEl.src = poster.image;
  imgEl.alt = poster.title;
  imgEl.style.transform = "scale(1)";
  document.getElementById("modalPageIndicator").innerText = `도서 p.${poster.bookPage} (안내문 원문)`;

  document.getElementById("modalInfoTable").innerHTML = `
    <div class="info-item" style="grid-column: 1 / -1;">
      <span class="info-item-label">구분</span>
      <span class="info-item-value">한국승강기안전공단(KoELSA) 공식 안전 포스터 및 기술 예방 안내문</span>
    </div>
  `;

  document.getElementById("modalCaseDescription").innerHTML = `
    <li>본 자료는 한국승강기안전공단에서 공식 배포한 핵심 재해예방 안전 지침 포스터입니다.</li>
    <li>좌측 원본 이미지를 확대하여 세부 수칙 및 기술 권고사항을 확인하실 수 있습니다.</li>
  `;
  document.getElementById("modalCaseCause").innerHTML = `<li>동일 유형의 중대사고 및 고장 예방을 위한 핵심 체크포인트 안내</li>`;
  document.getElementById("modalCasePrevention").innerHTML = `<li>사업장 및 시설 내 승강장 주변 게시 또는 작업 전 안전점검 TBM 자료로 활용</li>`;

  document.getElementById("modalPrevBtn").disabled = true;
  document.getElementById("modalNextBtn").disabled = true;

  showModal();
}

/* ---------------- FLOOD GUIDELINES ---------------- */
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
    <span>엘리베이터 침수상황 대응요령</span>
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
  document.getElementById("modalCasePrevention").innerHTML = `<li>주전원 즉각 차단, 배수 작업 실시, 건조 및 정밀안전진단 완료 후 운행 재개</li>`;

  document.getElementById("modalPrevBtn").disabled = true;
  document.getElementById("modalNextBtn").disabled = true;

  showModal();
}

/* ---------------- COMPONENT INSPECTION BRIEFING ---------------- */
function setPartCategoryFilter(category) {
  state.activePartFilter = category;

  // Update tab button styles
  ["ALL", "EL", "ES"].forEach(cat => {
    const btn = document.getElementById(`partFilterBtn${cat}`);
    if (btn) {
      if (cat === category) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });

  renderPartsSection();
}

function renderPartsSection() {
  const container = document.getElementById("partsGrid");
  if (!container || typeof PARTS_DATA === "undefined") return;

  const filteredParts = state.activePartFilter === "ALL"
    ? PARTS_DATA
    : PARTS_DATA.filter(p => p.category === state.activePartFilter);

  container.innerHTML = filteredParts.map(part => {
    const linkedCount = (part.linkedCaseIds && part.linkedCaseIds.length) || 0;
    const firstDefect = (part.inspectionPoints && part.inspectionPoints[0]) || "";
    const customBadge = part.customImage 
      ? `<span class="part-cat-badge" style="background:#059669; color:white; margin-left:auto;" title="사용자 등록 실제 부품 사진">📷 실사</span>`
      : "";
    return `
      <article class="part-card" onclick="openPartBriefing('${part.id}')" tabindex="0" role="button" aria-label="${part.name} 안전검사 브리핑">
        <div class="part-thumb-wrap">
          <img class="part-thumb-img" src="${part.customImage || part.image}" alt="${part.name}" loading="lazy" />
          <div class="part-overlay-tags">
            <span class="part-cat-badge">${part.categoryLabel}</span>
            ${customBadge}
          </div>
        </div>
        <div class="part-body">
          <div class="part-header-wrap">
            <span class="part-icon">${part.icon}</span>
            <div class="part-title-box">
              <h3 class="part-name">${part.customName || part.name}</h3>
              <div class="part-eng-name">${part.englishName}</div>
            </div>
          </div>
          <div class="part-location">📍 ${part.location}</div>
          <p class="part-summary">${part.summary}</p>
          <div class="part-defects-preview">
            <div class="part-defects-title">⚠️ 대표 검사지적 항목</div>
            <div class="part-defects-item" title="${firstDefect}">• ${firstDefect}</div>
          </div>
          <div class="part-footer">
            <span class="part-cases-badge">🔥 실사고 연계 <strong>${linkedCount}건</strong></span>
            <span class="part-btn-link">브리핑 보기 &rarr;</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/* ---------------- COMPONENT INSPECTION BRIEFING & CASE MATCHING ---------------- */
function initPartMappings() {
  try {
    const saved = localStorage.getItem("elevator_part_mappings");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof PARTS_DATA !== "undefined" && Array.isArray(PARTS_DATA)) {
        PARTS_DATA.forEach(part => {
          if (Array.isArray(parsed[part.id])) {
            part.linkedCaseIds = parsed[part.id];
          } else if (typeof DEFAULT_PARTS_MAPPING !== "undefined" && DEFAULT_PARTS_MAPPING[part.id]) {
            part.linkedCaseIds = [...DEFAULT_PARTS_MAPPING[part.id]];
          }
        });
      }
    }
  } catch (e) {
    console.error("Failed to load part mappings from localStorage", e);
  }
}

function savePartMappings() {
  try {
    if (typeof PARTS_DATA === "undefined") return;
    const mapping = {};
    PARTS_DATA.forEach(p => {
      mapping[p.id] = p.linkedCaseIds || [];
    });
    localStorage.setItem("elevator_part_mappings", JSON.stringify(mapping));
    renderPartsSection();
  } catch (e) {
    console.error("Failed to save part mappings", e);
  }
}

function getLinkedPartsForCase(caseId) {
  if (typeof PARTS_DATA === "undefined") return [];
  return PARTS_DATA.filter(p => p.linkedCaseIds && p.linkedCaseIds.includes(caseId));
}

function openPartBriefing(partId) {
  if (typeof PARTS_DATA === "undefined") return;
  const part = PARTS_DATA.find(p => p.id === partId);
  if (!part) return;

  state.currentBriefingPartId = partId;

  const badgeEl = document.getElementById("briefingModalBadge");
  if (badgeEl) {
    badgeEl.innerHTML = `
      <span class="part-cat-badge" style="background:var(--primary); padding:3px 8px; border-radius:4px; color:white;">${part.categoryLabel}</span>
      <span style="color:var(--text-muted); font-size:0.8rem; margin-left:4px;">${part.englishName}</span>
    `;
  }

  const titleEl = document.getElementById("briefingModalTitle");
  if (titleEl) titleEl.innerHTML = `${part.icon} ${part.customName || part.name}`;

  const btnResetBriefing = document.getElementById("btnResetBriefingTitle");
  if (btnResetBriefing) btnResetBriefing.style.display = part.customName ? "inline-flex" : "none";

  const locEl = document.getElementById("briefingModalLocation");
  if (locEl) locEl.innerHTML = `📍 설치 및 점검 위치: ${part.location}`;

  const imgEl = document.getElementById("briefingModalImg");
  if (imgEl) {
    imgEl.src = part.customImage || part.image;
    imgEl.alt = part.name;
  }

  const badgeCustomPart = document.getElementById("briefingCustomImgBadge");
  const btnResetPart = document.getElementById("btnResetPartImg");
  if (part.customImage) {
    if (badgeCustomPart) badgeCustomPart.style.display = "flex";
    if (btnResetPart) btnResetPart.style.display = "inline-flex";
  } else {
    if (badgeCustomPart) badgeCustomPart.style.display = "none";
    if (btnResetPart) btnResetPart.style.display = "none";
  }

  const noteEl = document.getElementById("briefingModalImgNote");
  if (noteEl) noteEl.innerText = part.customImage ? "사용자 등록 부품 현장 사진" : (part.diagramNote || "");

  const sumEl = document.getElementById("briefingModalSummary");
  if (sumEl) sumEl.innerText = part.summary;

  const inspectListEl = document.getElementById("briefingModalInspectionPoints");
  if (inspectListEl) {
    inspectListEl.innerHTML = (part.inspectionPoints || []).map(pt => `<li>${pt}</li>`).join("");
  }

  const hazardEl = document.getElementById("briefingModalHazard");
  if (hazardEl) hazardEl.innerText = part.failureHazard;

  const actionEl = document.getElementById("briefingModalAction");
  if (actionEl) actionEl.innerText = part.correctiveAction;

  // Render linked cases list
  renderBriefingLinkedCases(part);

  const modal = document.getElementById("briefingModal");
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function renderBriefingLinkedCases(part) {
  const caseListEl = document.getElementById("briefingModalCasesList");
  const countEl = document.getElementById("briefingModalCaseCount");
  const linkedIds = part.linkedCaseIds || [];

  if (countEl) countEl.innerText = `총 ${linkedIds.length}건 연계`;

  if (caseListEl) {
    if (linkedIds.length === 0) {
      caseListEl.innerHTML = `
        <div style="background:var(--bg-card); border:1px dashed var(--border); border-radius:var(--radius-md); padding:2rem 1rem; text-align:center;">
          <div style="font-size:2rem; margin-bottom:0.5rem;">📂</div>
          <div style="color:var(--text-main); font-weight:700; margin-bottom:0.25rem;">연계된 사고 사례가 없습니다</div>
          <div style="color:var(--text-muted); font-size:0.8rem; margin-bottom:1rem;">상단의 [➕ 사례 추가] 버튼을 눌러 183건 사례 중 원하는 사고를 연계해 보세요.</div>
          <button class="btn-briefing-tool primary" onclick="openAddCaseModal()">
            ➕ 사고사례 연계 추가
          </button>
        </div>
      `;
    } else {
      const linkedCases = linkedIds.map(id => CASES_DATA.find(c => c.id === id)).filter(Boolean);
      caseListEl.innerHTML = linkedCases.map(c => `
        <div class="briefing-case-item">
          <img class="briefing-case-img" src="${c.customImage || c.image}" alt="${c.title}" onclick="viewCaseFromBriefing(${c.id})" loading="lazy" />
          <div class="briefing-case-content" onclick="viewCaseFromBriefing(${c.id})" tabindex="0" role="button" aria-label="${c.title} 상세 보기">
            <div class="briefing-case-top">
              <span class="badge-year badge-year-${c.bookYear}" style="font-size:0.65rem; padding:2px 6px;">${c.bookYear}년 발간</span>
              <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">#${c.id}</span>
              <span style="font-size:0.75rem; color:var(--primary); font-weight:700;">${c.elevatorType}</span>
              <span class="badge-severity ${c.severity}" style="font-size:0.65rem; padding:2px 6px; margin-left:auto;">${c.severity}</span>
              ${c.customImage ? `<span class="badge-severity" style="background:#059669; color:white; font-size:0.6rem; padding:1px 5px;">📷 실사</span>` : ""}
            </div>
            <div class="briefing-case-title">${c.customTitle || c.title}</div>
            <div class="briefing-case-desc">${(c.description && c.description[0]) || c.summary || ""}</div>
          </div>
          <div class="briefing-case-actions">
            <button class="btn-case-action" onclick="openMoveCaseModal(${c.id}, '${part.id}', event)" title="다른 핵심 부품으로 이동">
              <span>⇄ 부품 이동</span>
            </button>
            <button class="btn-case-action unlink" onclick="unlinkCaseFromPart(${c.id}, '${part.id}', event)" title="이 부품에서 연계 해제">
              <span>✕ 해제</span>
            </button>
          </div>
        </div>
      `).join("");
    }
  }
}

function closePartBriefing() {
  const modal = document.getElementById("briefingModal");
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
  state.currentBriefingPartId = null;
}

function viewCaseFromBriefing(caseId) {
  closePartBriefing();
  setTimeout(() => {
    openCaseModal(caseId);
  }, 150);
}

/* ---------------- CASE MOVEMENT MODAL ---------------- */
function openMoveCaseModal(caseId, sourcePartId, event) {
  if (event) event.stopPropagation();
  state.currentMoveCaseId = caseId;
  state.currentMoveSourcePartId = sourcePartId || null;

  const c = CASES_DATA.find(x => x.id === caseId);
  if (!c) return;

  const infoEl = document.getElementById("moveModalTargetInfo");
  if (infoEl) {
    infoEl.innerText = `사례 #${c.id} 「${c.customTitle || c.title}」 (${c.elevatorType} / ${c.accidentType})`;
  }

  // Render EL & ES parts
  renderMovePartButtons("movePartListEL", "EL", sourcePartId, caseId);
  renderMovePartButtons("movePartListES", "ES", sourcePartId, caseId);

  const modal = document.getElementById("moveCaseModal");
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function renderMovePartButtons(containerId, category, currentPartId, caseId) {
  const container = document.getElementById(containerId);
  if (!container || typeof PARTS_DATA === "undefined") return;

  const parts = PARTS_DATA.filter(p => p.category === category);
  container.innerHTML = parts.map(p => {
    const isCurrent = p.id === currentPartId;
    const count = (p.linkedCaseIds && p.linkedCaseIds.length) || 0;
    return `
      <button class="move-part-btn ${isCurrent ? 'current' : ''}" 
              onclick="${isCurrent ? '' : `moveCaseToPart(${caseId}, '${p.id}', '${currentPartId || ''}')`}">
        <span style="font-size:1.15rem;">${p.icon}</span>
        <div style="flex-grow:1; min-width:0;">
          <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.customName || p.name}</div>
          <div style="font-size:0.7rem; color:var(--text-muted); font-weight:normal; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.englishName}</div>
        </div>
        <span class="move-part-badge">${isCurrent ? '현재 위치' : (count + '건')}</span>
      </button>
    `;
  }).join("");
}

function closeMoveCaseModal() {
  const modal = document.getElementById("moveCaseModal");
  if (modal) {
    modal.classList.remove("open");
    // If briefing modal or case modal is still open, keep body overflow hidden
    const briefingOpen = document.getElementById("briefingModal")?.classList.contains("open");
    const caseOpen = document.getElementById("caseModal")?.classList.contains("open");
    if (!briefingOpen && !caseOpen) {
      document.body.style.overflow = "";
    }
  }
  state.currentMoveCaseId = null;
  state.currentMoveSourcePartId = null;
}

function openMoveCaseFromDetailModal(caseId) {
  const linked = getLinkedPartsForCase(caseId);
  const sourcePartId = linked.length > 0 ? linked[0].id : null;
  openMoveCaseModal(caseId, sourcePartId);
}

function moveCaseToPart(caseId, targetPartId, sourcePartId) {
  const targetPart = PARTS_DATA.find(p => p.id === targetPartId);
  if (!targetPart) return;

  // Remove from source part (or from all parts if re-assigning)
  if (sourcePartId) {
    const sourcePart = PARTS_DATA.find(p => p.id === sourcePartId);
    if (sourcePart && sourcePart.linkedCaseIds) {
      sourcePart.linkedCaseIds = sourcePart.linkedCaseIds.filter(id => id !== caseId);
    }
  } else {
    // If source not specified, remove from any current part
    PARTS_DATA.forEach(p => {
      if (p.linkedCaseIds) {
        p.linkedCaseIds = p.linkedCaseIds.filter(id => id !== caseId);
      }
    });
  }

  // Add to target part
  if (!targetPart.linkedCaseIds) targetPart.linkedCaseIds = [];
  if (!targetPart.linkedCaseIds.includes(caseId)) {
    targetPart.linkedCaseIds.push(caseId);
  }

  // Save to localStorage and update main UI
  savePartMappings();
  closeMoveCaseModal();

  // If briefing modal is open, refresh its linked list
  if (state.currentBriefingPartId) {
    const currentPart = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
    if (currentPart) renderBriefingLinkedCases(currentPart);
  }

  // If case detail modal is open, refresh its content
  const caseModal = document.getElementById("caseModal");
  if (caseModal && caseModal.classList.contains("open")) {
    const caseObj = CASES_DATA.find(c => c.id === caseId);
    if (caseObj) renderCaseModalContent(caseObj);
  }

  showToast(`✅ 사례 #${caseId}이(가) 「${targetPart.name}」 부품으로 이동되었습니다.`, 'success');
}

function unlinkCaseFromPart(caseId, partId, event) {
  if (event) event.stopPropagation();
  const part = PARTS_DATA.find(p => p.id === partId);
  if (!part) return;

  part.linkedCaseIds = (part.linkedCaseIds || []).filter(id => id !== caseId);
  savePartMappings();
  renderBriefingLinkedCases(part);

  showToast(`🗑️ 사례 #${caseId}의 연계가 해제되었습니다.`, 'info');
}

/* ---------------- ADD CASE TO PART MODAL ---------------- */
function openAddCaseModal() {
  const part = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
  if (!part) return;

  const infoEl = document.getElementById("addModalTargetPartInfo");
  if (infoEl) {
    infoEl.innerHTML = `${part.icon} 목표 부품: ${part.name} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(${part.categoryLabel})</span>`;
  }

  const searchInput = document.getElementById("addCaseSearchInput");
  if (searchInput) {
    searchInput.value = "";
    state.addCaseSearchQuery = "";
  }

  renderAddCaseCandidates(part);

  const modal = document.getElementById("addCaseModal");
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeAddCaseModal() {
  const modal = document.getElementById("addCaseModal");
  if (modal) {
    modal.classList.remove("open");
    const briefingOpen = document.getElementById("briefingModal")?.classList.contains("open");
    if (!briefingOpen) {
      document.body.style.overflow = "";
    }
  }
}

function renderAddCaseCandidates(part) {
  const container = document.getElementById("addCaseCandidatesList");
  const countEl = document.getElementById("addCaseCandidatesCount");
  if (!container) return;

  const q = (state.addCaseSearchQuery || "").toLowerCase().trim();
  const linkedIds = part.linkedCaseIds || [];

  const candidates = CASES_DATA.filter(c => {
    if (q === "") {
      // Default: match elevator category first or show all
      return true;
    }
    const matchTitle = (c.customTitle ? (c.customTitle.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)) : c.title.toLowerCase().includes(q));
    const matchSummary = (c.summary || "").toLowerCase().includes(q);
    const matchElev = c.elevatorType.toLowerCase().includes(q);
    const matchAcc = c.accidentType.toLowerCase().includes(q);
    const matchTags = c.tags ? c.tags.some(t => t.toLowerCase().includes(q)) : false;
    const matchYear = String(c.bookYear).includes(q) || String(c.accidentYear).includes(q);
    const matchId = String(c.id) === q;

    return matchTitle || matchSummary || matchElev || matchAcc || matchTags || matchYear || matchId;
  });

  if (countEl) {
    countEl.innerText = `검색 결과: ${candidates.length}건 (현재 연계: ${linkedIds.length}건)`;
  }

  if (candidates.length === 0) {
    container.innerHTML = `
      <div style="color:var(--text-muted); text-align:center; padding:2rem 1rem;">
        검색 결과와 일치하는 사고 사례가 없습니다.
      </div>
    `;
    return;
  }

  container.innerHTML = candidates.map(c => {
    const isAlreadyLinked = linkedIds.includes(c.id);
    const otherParts = getLinkedPartsForCase(c.id).filter(p => p.id !== part.id);
    let otherPartBadge = "";
    if (otherParts.length > 0) {
      otherPartBadge = `<span style="font-size:0.68rem; color:#f59e0b; background:rgba(245,158,11,0.12); padding:1px 5px; border-radius:3px;">현재: ${otherParts[0].customName || otherParts[0].name}</span>`;
    }

    return `
      <div class="add-candidate-item">
        <img class="add-candidate-img" src="${c.customImage || c.image}" alt="${c.title}" loading="lazy" />
        <div class="add-candidate-info">
          <div class="add-candidate-top">
            <span class="badge-year badge-year-${c.bookYear}" style="font-size:0.65rem; padding:1px 5px;">${c.bookYear}년</span>
            <span style="font-weight:700; color:var(--text-muted);">#${c.id}</span>
            <span style="color:var(--primary); font-weight:700;">${c.elevatorType}</span>
            <span class="badge-severity ${c.severity}" style="font-size:0.65rem; padding:1px 5px;">${c.severity}</span>
            ${otherPartBadge}
          </div>
          <div class="add-candidate-title" title="${c.customTitle || c.title}">${c.customTitle || c.title}</div>
        </div>
        <div class="add-candidate-action">
          ${isAlreadyLinked ? `
            <button class="btn-add-candidate already" disabled>✓ 연계됨</button>
          ` : `
            <button class="btn-add-candidate" onclick="addCaseToPart(${c.id}, '${part.id}')">
              ➕ 연계 추가
            </button>
          `}
        </div>
      </div>
    `;
  }).join("");
}

function addCaseToPart(caseId, partId) {
  const part = PARTS_DATA.find(p => p.id === partId);
  if (!part) return;

  if (!part.linkedCaseIds) part.linkedCaseIds = [];
  if (!part.linkedCaseIds.includes(caseId)) {
    part.linkedCaseIds.push(caseId);
  }

  savePartMappings();
  renderBriefingLinkedCases(part);
  renderAddCaseCandidates(part);

  showToast(`➕ 사례 #${caseId}이(가) 「${part.name}」에 연계 추가되었습니다.`, 'success');
}

/* ---------------- RESET & EXPORT MAPPINGS ---------------- */
function resetCurrentPartMapping() {
  const partId = state.currentBriefingPartId;
  if (!partId) return;

  if (typeof DEFAULT_PARTS_MAPPING === "undefined") return;
  const part = PARTS_DATA.find(p => p.id === partId);
  if (!part) return;

  const defaultIds = DEFAULT_PARTS_MAPPING[partId] || [];
  part.linkedCaseIds = [...defaultIds];

  savePartMappings();
  renderBriefingLinkedCases(part);

  showToast(`⟲ 「${part.name}」의 사례 연계가 기본 설정으로 복원되었습니다.`, 'info');
}

function resetAllPartMappings() {
  if (!confirm("모든 핵심 부품의 사고사례 매칭을 기본 설정값으로 초기화하시겠습니까?")) return;

  localStorage.removeItem("elevator_part_mappings");
  if (typeof DEFAULT_PARTS_MAPPING !== "undefined") {
    PARTS_DATA.forEach(p => {
      p.linkedCaseIds = [...(DEFAULT_PARTS_MAPPING[p.id] || [])];
    });
  }

  savePartMappings();

  if (state.currentBriefingPartId) {
    const cp = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
    if (cp) renderBriefingLinkedCases(cp);
  }

  showToast("⟲ 모든 부품의 사고사례 매칭이 기본값으로 초기화되었습니다.", 'info');
}

function exportPartMappings() {
  const mapping = {};
  PARTS_DATA.forEach(p => {
    mapping[p.id] = p.linkedCaseIds || [];
  });
  const jsonStr = JSON.stringify(mapping, null, 2);

  const textarea = document.getElementById("exportJsonTextarea");
  if (textarea) textarea.value = jsonStr;

  const modal = document.getElementById("exportModal");
  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
}

function closeExportModal() {
  const modal = document.getElementById("exportModal");
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
}

function copyExportJson() {
  const textarea = document.getElementById("exportJsonTextarea");
  if (textarea) {
    textarea.select();
    navigator.clipboard.writeText(textarea.value).then(() => {
      showToast("📋 매칭 JSON 데이터가 클립보드에 복사되었습니다.", 'success');
    }).catch(() => {
      document.execCommand("copy");
      showToast("📋 클립보드에 복사되었습니다.", 'success');
    });
  }
}

function downloadExportJson() {
  const textarea = document.getElementById("exportJsonTextarea");
  if (!textarea) return;

  const blob = new Blob([textarea.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `elevator_parts_case_mapping_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("⬇️ 매칭 JSON 파일이 다운로드되었습니다.", 'success');
}

/* ---------------- INDEXEDDB IMAGE STORAGE & UPLOAD SYSTEM ---------------- */
const IMAGE_DB_NAME = "ElevatorCustomImageStore";
const IMAGE_DB_VERSION = 1;
const IMAGE_STORE_NAME = "custom_images";

function openImageDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(IMAGE_DB_NAME, IMAGE_DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        db.createObjectStore(IMAGE_STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveCustomImageDB(key, dataUrl, filename) {
  try {
    const db = await openImageDB();
    if (!db) {
      localStorage.setItem("custom_img_" + key, dataUrl);
      return true;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE_NAME, "readwrite");
      const store = tx.objectStore(IMAGE_STORE_NAME);
      store.put({ key, dataUrl, filename: filename || "image", updatedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("IndexedDB save failed, fallback to localStorage", err);
    try {
      localStorage.setItem("custom_img_" + key, dataUrl);
    } catch(e) {}
    return true;
  }
}

async function removeCustomImageDB(key) {
  try {
    const db = await openImageDB();
    if (!db) {
      localStorage.removeItem("custom_img_" + key);
      return true;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE_NAME, "readwrite");
      const store = tx.objectStore(IMAGE_STORE_NAME);
      store.delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    localStorage.removeItem("custom_img_" + key);
    return true;
  }
}

async function getAllCustomImagesDB() {
  try {
    const db = await openImageDB();
    if (!db) {
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("custom_img_")) {
          items.push({ key: k.replace("custom_img_", ""), dataUrl: localStorage.getItem(k) });
        }
      }
      return items;
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE_NAME, "readonly");
      const store = tx.objectStore(IMAGE_STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to get all custom images", err);
    return [];
  }
}

async function initCustomImages() {
  try {
    const all = await getAllCustomImagesDB();
    if (!all || all.length === 0) return;

    all.forEach(item => {
      if (item.key.startsWith("case_")) {
        const cid = parseInt(item.key.replace("case_", ""), 10);
        const c = CASES_DATA.find(x => x.id === cid);
        if (c) c.customImage = item.dataUrl;
      } else if (item.key.startsWith("part_")) {
        const pid = item.key.replace("part_", "");
        const p = PARTS_DATA.find(x => x.id === pid);
        if (p) p.customImage = item.dataUrl;
      }
    });
  } catch (err) {
    console.error("Failed to init custom images", err);
  }
}

/* --- Case Image Upload & Reset --- */
function triggerCaseImageUpload() {
  const input = document.getElementById("caseImageFileInput");
  if (input) {
    input.value = "";
    input.click();
  }
}

function handleCaseImageUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  processCaseImageFile(file);
}

function processCaseImageFile(file) {
  if (!file.type.startsWith("image/")) {
    showToast("⚠️ 이미지 파일(PNG, JPG, WebP 등)만 업로드할 수 있습니다.", "warning");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    const navList = state.filteredCases.length > 0 ? state.filteredCases : CASES_DATA;
    const currentCase = navList[state.currentCaseIndex];
    if (!currentCase) return;

    currentCase.customImage = dataUrl;
    await saveCustomImageDB("case_" + currentCase.id, dataUrl, file.name);

    renderCaseModalContent(currentCase);
    renderCasesGrid();

    // If briefing modal is open, refresh linked cases
    if (state.currentBriefingPartId) {
      const part = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
      if (part) renderBriefingLinkedCases(part);
    }

    showToast(`📷 사례 #${currentCase.id}의 실제 사진이 성공적으로 업로드되었습니다.`, "success");
  };
  reader.readAsDataURL(file);
}

async function resetCaseImageToDefault() {
  const navList = state.filteredCases.length > 0 ? state.filteredCases : CASES_DATA;
  const currentCase = navList[state.currentCaseIndex];
  if (!currentCase) return;

  if (!confirm(`사례 #${currentCase.id}의 등록된 실제 사진을 삭제하고 공단 기본 도해도로 복원하시겠습니까?`)) {
    return;
  }

  delete currentCase.customImage;
  await removeCustomImageDB("case_" + currentCase.id);

  renderCaseModalContent(currentCase);
  renderCasesGrid();

  if (state.currentBriefingPartId) {
    const part = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
    if (part) renderBriefingLinkedCases(part);
  }

  showToast(`⟲ 사례 #${currentCase.id}의 이미지가 기본 도해도로 복원되었습니다.`, "info");
}

/* --- Part Image Upload & Reset --- */
function triggerPartImageUpload() {
  const input = document.getElementById("partImageFileInput");
  if (input) {
    input.value = "";
    input.click();
  }
}

function handlePartImageUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  processPartImageFile(file);
}

function processPartImageFile(file) {
  if (!file.type.startsWith("image/")) {
    showToast("⚠️ 이미지 파일(PNG, JPG, WebP 등)만 업로드할 수 있습니다.", "warning");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    const part = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
    if (!part) return;

    part.customImage = dataUrl;
    await saveCustomImageDB("part_" + part.id, dataUrl, file.name);

    // Refresh briefing modal image
    const imgEl = document.getElementById("briefingModalImg");
    if (imgEl) imgEl.src = dataUrl;

    const badgeCustomPart = document.getElementById("briefingCustomImgBadge");
    const btnResetPart = document.getElementById("btnResetPartImg");
    if (badgeCustomPart) badgeCustomPart.style.display = "flex";
    if (btnResetPart) btnResetPart.style.display = "inline-flex";

    const noteEl = document.getElementById("briefingModalImgNote");
    if (noteEl) noteEl.innerText = "사용자 등록 부품 현장 사진";

    renderPartsSection();
    showToast(`📷 「${part.name}」 부품 실제 사진이 성공적으로 업로드되었습니다.`, "success");
  };
  reader.readAsDataURL(file);
}

async function resetPartImageToDefault() {
  const part = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
  if (!part) return;

  if (!confirm(`「${part.name}」의 등록된 실제 사진을 삭제하고 공단 기본 구조도로 복원하시겠습니까?`)) {
    return;
  }

  delete part.customImage;
  await removeCustomImageDB("part_" + part.id);

  const imgEl = document.getElementById("briefingModalImg");
  if (imgEl) imgEl.src = part.image;

  const badgeCustomPart = document.getElementById("briefingCustomImgBadge");
  const btnResetPart = document.getElementById("btnResetPartImg");
  if (badgeCustomPart) badgeCustomPart.style.display = "none";
  if (btnResetPart) btnResetPart.style.display = "none";

  const noteEl = document.getElementById("briefingModalImgNote");
  if (noteEl) noteEl.innerText = part.diagramNote || "";

  renderPartsSection();
  showToast(`⟲ 「${part.name}」 이미지가 기본 구조도로 복원되었습니다.`, "info");
}

/* --- Drag & Drop Setup --- */
function setupImageDragAndDrop() {
  // Case Modal Dropzone
  const caseDropArea = document.getElementById("modalImgContainer");
  const caseDropOverlay = document.getElementById("modalDropOverlay");

  if (caseDropArea && caseDropOverlay) {
    ['dragenter', 'dragover'].forEach(name => {
      caseDropArea.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        caseDropOverlay.classList.add("active");
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      caseDropArea.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        caseDropOverlay.classList.remove("active");
      });
    });

    caseDropArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt && dt.files && dt.files[0];
      if (file) {
        processCaseImageFile(file);
      }
    });
  }

  // Part Modal Dropzone
  const partDropArea = document.getElementById("briefingImgBox");
  const partDropOverlay = document.getElementById("briefingDropOverlay");

  if (partDropArea && partDropOverlay) {
    ['dragenter', 'dragover'].forEach(name => {
      partDropArea.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        partDropOverlay.classList.add("active");
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      partDropArea.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        partDropOverlay.classList.remove("active");
      });
    });

    partDropArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt && dt.files && dt.files[0];
      if (file) {
        processPartImageFile(file);
      }
    });
  }
}

/* ---------------- TOAST NOTIFICATION ---------------- */
let toastTimeout = null;
function showToast(message, type = 'success') {
  const toast = document.getElementById("toastNotification");
  const msgEl = document.getElementById("toastMessage");
  const iconEl = document.getElementById("toastIcon");

  if (!toast || !msgEl) return;

  if (toastTimeout) clearTimeout(toastTimeout);

  msgEl.innerText = message;
  toast.className = `toast-notification show ${type}`;

  if (iconEl) {
    if (type === 'success') iconEl.innerText = "✅";
    else if (type === 'info') iconEl.innerText = "ℹ️";
    else if (type === 'warning') iconEl.innerText = "⚠️";
  }

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

/* ---------------- EVENT LISTENERS ---------------- */
function setupEventListeners() {
  // Search Input
  const searchInput = document.getElementById("caseSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      applyFilters();
    });
  }

  // Add Case Candidate Search Input
  const addCaseSearchInput = document.getElementById("addCaseSearchInput");
  if (addCaseSearchInput) {
    addCaseSearchInput.addEventListener("input", (e) => {
      state.addCaseSearchQuery = e.target.value;
      if (state.currentBriefingPartId) {
        const part = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
        if (part) renderAddCaseCandidates(part);
      }
    });
  }

  // Keyboard Navigation
  document.addEventListener("keydown", (e) => {
    const moveModal = document.getElementById("moveCaseModal");
    const isMoveOpen = moveModal && moveModal.classList.contains("open");

    const addModal = document.getElementById("addCaseModal");
    const isAddOpen = addModal && addModal.classList.contains("open");

    const exportModal = document.getElementById("exportModal");
    const isExportOpen = exportModal && exportModal.classList.contains("open");

    const briefingModal = document.getElementById("briefingModal");
    const isBriefingOpen = briefingModal && briefingModal.classList.contains("open");

    const caseModal = document.getElementById("caseModal");
    const isCaseModalOpen = caseModal && caseModal.classList.contains("open");

    if (e.key === "Escape") {
      if (isMoveOpen) {
        closeMoveCaseModal();
      } else if (isAddOpen) {
        closeAddCaseModal();
      } else if (isExportOpen) {
        closeExportModal();
      } else if (isCaseModalOpen) {
        closeModal();
      } else if (isBriefingOpen) {
        closePartBriefing();
      }
    } else if (e.key === "ArrowLeft" && isCaseModalOpen && state.currentModalType === "case" && !isMoveOpen) {
      prevCase();
    } else if (e.key === "ArrowRight" && isCaseModalOpen && state.currentModalType === "case" && !isMoveOpen) {
      nextCase();
    } else if (e.key === "/" && !isCaseModalOpen && !isBriefingOpen && !isMoveOpen && !isAddOpen && document.activeElement !== searchInput) {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

  // Modal Backdrop Clicks
  const caseModalBackdrop = document.getElementById("caseModal");
  if (caseModalBackdrop) {
    caseModalBackdrop.addEventListener("click", (e) => {
      if (e.target === caseModalBackdrop) closeModal();
    });
  }

  const briefingModalBackdrop = document.getElementById("briefingModal");
  if (briefingModalBackdrop) {
    briefingModalBackdrop.addEventListener("click", (e) => {
      if (e.target === briefingModalBackdrop) closePartBriefing();
    });
  }

  const moveModalBackdrop = document.getElementById("moveCaseModal");
  if (moveModalBackdrop) {
    moveModalBackdrop.addEventListener("click", (e) => {
      if (e.target === moveModalBackdrop) closeMoveCaseModal();
    });
  }

  const addModalBackdrop = document.getElementById("addCaseModal");
  if (addModalBackdrop) {
    addModalBackdrop.addEventListener("click", (e) => {
      if (e.target === addModalBackdrop) closeAddCaseModal();
    });
  }

  const exportModalBackdrop = document.getElementById("exportModal");
  if (exportModalBackdrop) {
    exportModalBackdrop.addEventListener("click", (e) => {
      if (e.target === exportModalBackdrop) closeExportModal();
    });
  }
}

/* ---------------- CUSTOM TITLES MANAGEMENT ---------------- */
function initCustomTitles() {
  try {
    const saved = localStorage.getItem("elevator_custom_titles");
    if (!saved) return;
    const data = JSON.parse(saved);
    if (data.cases && typeof CASES_DATA !== "undefined") {
      Object.keys(data.cases).forEach(id => {
        const c = CASES_DATA.find(x => x.id === parseInt(id, 10));
        if (c) c.customTitle = data.cases[id];
      });
    }
    if (data.parts && typeof PARTS_DATA !== "undefined") {
      Object.keys(data.parts).forEach(id => {
        const p = PARTS_DATA.find(x => x.id === id);
        if (p) p.customName = data.parts[id];
      });
    }
  } catch (e) {
    console.error("Error loading custom titles:", e);
  }
}

function saveCustomTitles() {
  try {
    const data = { cases: {}, parts: {} };
    if (typeof CASES_DATA !== "undefined") {
      CASES_DATA.forEach(c => {
        if (c.customTitle) data.cases[c.id] = c.customTitle;
      });
    }
    if (typeof PARTS_DATA !== "undefined") {
      PARTS_DATA.forEach(p => {
        if (p.customName) data.parts[p.id] = p.customName;
      });
    }
    localStorage.setItem("elevator_custom_titles", JSON.stringify(data));
  } catch (e) {
    console.error("Error saving custom titles:", e);
  }
}

function editBriefingTitle() {
  if (typeof PARTS_DATA === "undefined") return;
  const part = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
  if (!part) return;

  const currentTitle = part.customName || part.name;
  const newTitle = prompt("수정할 부품 브리핑 제목(부품명)을 입력하세요:", currentTitle);
  if (newTitle !== null && newTitle.trim() !== "" && newTitle.trim() !== currentTitle) {
    part.customName = newTitle.trim();
    saveCustomTitles();

    const titleEl = document.getElementById("briefingModalTitle");
    if (titleEl) titleEl.innerHTML = `${part.icon} ${part.customName}`;

    const btnReset = document.getElementById("btnResetBriefingTitle");
    if (btnReset) btnReset.style.display = "inline-flex";

    renderPartsSection();
    showToast(`✏️ 부품 브리핑 제목이 「${part.customName}」(으)로 수정되었습니다.`, "success");
  }
}

function resetBriefingTitle() {
  if (typeof PARTS_DATA === "undefined") return;
  const part = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
  if (!part) return;

  if (!confirm(`「${part.customName}」 제목을 기본 부품명(「${part.name}」)으로 복원하시겠습니까?`)) {
    return;
  }

  delete part.customName;
  saveCustomTitles();

  const titleEl = document.getElementById("briefingModalTitle");
  if (titleEl) titleEl.innerHTML = `${part.icon} ${part.name}`;

  const btnReset = document.getElementById("btnResetBriefingTitle");
  if (btnReset) btnReset.style.display = "none";

  renderPartsSection();
  showToast(`⟲ 「${part.name}」 기본 제목으로 복원되었습니다.`, "info");
}

function editCaseTitle() {
  if (typeof CASES_DATA === "undefined") return;
  const currentCase = (state.currentViewingCaseId ? CASES_DATA.find(c => c.id === state.currentViewingCaseId) : null)
    || (state.filteredCases.length > 0 ? state.filteredCases[state.currentCaseIndex] : CASES_DATA[state.currentCaseIndex]);
  if (!currentCase) return;

  const currentTitle = currentCase.customTitle || currentCase.title;
  const newTitle = prompt("수정할 사고 브리핑 제목을 입력하세요:", currentTitle);
  if (newTitle !== null && newTitle.trim() !== "" && newTitle.trim() !== currentTitle) {
    currentCase.customTitle = newTitle.trim();
    saveCustomTitles();

    const titleEl = document.getElementById("modalTitle");
    if (titleEl) titleEl.innerText = currentCase.customTitle;

    const btnReset = document.getElementById("btnResetCaseTitle");
    if (btnReset) btnReset.style.display = "inline-flex";

    renderCasesGrid();
    if (state.currentBriefingPartId) {
      const cp = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
      if (cp) renderBriefingLinkedCases(cp);
    }
    showToast(`✏️ 사례 #${currentCase.id} 제목이 수정되었습니다.`, "success");
  }
}

function resetCaseTitle() {
  if (typeof CASES_DATA === "undefined") return;
  const currentCase = (state.currentViewingCaseId ? CASES_DATA.find(c => c.id === state.currentViewingCaseId) : null)
    || (state.filteredCases.length > 0 ? state.filteredCases[state.currentCaseIndex] : CASES_DATA[state.currentCaseIndex]);
  if (!currentCase) return;

  if (!confirm(`사례 #${currentCase.id}의 제목을 도서 기본 제목(「${currentCase.title}」)으로 복원하시겠습니까?`)) {
    return;
  }

  delete currentCase.customTitle;
  saveCustomTitles();

  const titleEl = document.getElementById("modalTitle");
  if (titleEl) titleEl.innerText = currentCase.title;

  const btnReset = document.getElementById("btnResetCaseTitle");
  if (btnReset) btnReset.style.display = "none";

  renderCasesGrid();
  if (state.currentBriefingPartId) {
    const cp = PARTS_DATA.find(p => p.id === state.currentBriefingPartId);
    if (cp) renderBriefingLinkedCases(cp);
  }
  showToast(`⟲ 도서 기본 사고 제목으로 복원되었습니다.`, "info");
}


