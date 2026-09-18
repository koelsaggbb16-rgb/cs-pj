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
  renderYearTabs();
  renderTrendSection();
  updateDashboardAndKPIs();
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
    return `
      <article class="case-card" onclick="openCaseModal(${c.id})">
        <div class="case-thumb-wrap">
          <img class="case-thumb-img" src="${c.image}" alt="${c.title}" loading="lazy" />
          <div class="thumb-tag-top">
            <span class="badge-year ${yearBadgeClass}">${c.bookYear} 사례집</span>
            <span class="badge-case-id">#${String(c.caseId || c.id)}</span>
            <span class="badge-severity ${c.severity}">${c.severity}</span>
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

          <h3 class="case-title">${c.title}</h3>
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
  // Title & Header
  document.getElementById("modalCategoryBadge").innerHTML = `
    <span class="badge-year badge-year-${c.bookYear}">${c.bookYear}년 발간</span>
    <span>#${c.caseId || c.id}</span> • 
    <span>${c.elevatorType}</span> • 
    <span class="badge-severity ${c.severity}">${c.severity}</span>
  `;
  document.getElementById("modalTitle").innerText = c.title;

  // Image side
  const imgEl = document.getElementById("modalDetailImg");
  imgEl.src = c.image;
  imgEl.alt = c.title;
  imgEl.style.transform = `scale(1)`;
  document.getElementById("modalPageIndicator").innerText = `${c.yearBadge || (c.bookYear + '년 사례집')} 원문 p.${c.bookPage || c.page}`;

  // Info side: Table
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

  // Keyboard Navigation
  document.addEventListener("keydown", (e) => {
    const modal = document.getElementById("caseModal");
    const isModalOpen = modal && modal.classList.contains("open");

    if (e.key === "Escape" && isModalOpen) {
      closeModal();
    } else if (e.key === "ArrowLeft" && isModalOpen && state.currentModalType === "case") {
      prevCase();
    } else if (e.key === "ArrowRight" && isModalOpen && state.currentModalType === "case") {
      nextCase();
    } else if (e.key === "/" && !isModalOpen && document.activeElement !== searchInput) {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });

  // Modal Backdrop Click
  const modalBackdrop = document.getElementById("caseModal");
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }
}
