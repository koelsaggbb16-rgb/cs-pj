/**
 * 승강기 주요 부품별 안전검사 보완사항 & 실사고 연계 비주얼 브리핑 데이터셋
 * 한국승강기안전공단(KoELSA) 검사 기준 및 공식 사고 사례집 연계
 */

const DEFAULT_PARTS_MAPPING = {
  guide_shoe: [7, 9, 38, 45],
  interphone: [18, 51],
  door_interlock: [15, 23, 54, 55],
  brake: [23, 24, 94],
  car_door_sensor: [10, 26, 35, 36, 37, 47],
  governor: [42, 95],
  safety_gear_buffer: [12, 180],
  control_panel: [16, 22, 24, 54],
  wire_rope: [13, 41, 44],
  level_difference: [11, 21, 48],
  comb: [2, 6, 25, 31],
  skirt_guard: [3, 33, 39],
  handrail: [1, 17, 27, 46, 50, 52, 53],
  anti_reversal: [20, 40, 43, 50]
};

const PARTS_DATA = [
  {
    id: "guide_shoe",
    name: "승강장문 가이드슈 & 이탈방지장치",
    englishName: "Landing Door Guide Shoe & Anti-Derailment Device",
    category: "EL",
    categoryLabel: "엘리베이터",
    location: "승강장 출입문 하단부 및 도어 실(Sill) 문턱 홈",
    icon: "🚪",
    image: "images/2024/page_26.png",
    diagramNote: "가이드슈 구조 및 도어 하부 이탈방지 구조도 (사례집 도해도)",
    summary: "출입문 하단을 지지하고 레일 홈에서 문짝이 이탈하지 않도록 잡아주는 핵심 부품",
    inspectionPoints: [
      "승강장문 가이드슈 마모 한계(마모율 20% 초과) 및 하부 유격 과다",
      "문턱 홈(Sill) 내부 이물질 적체로 인한 가이드슈 걸림 및 물림 깊이 부족",
      "승강장문 이탈방지장치(키홀더, 스토퍼 핀) 파손, 볼트 풀림 또는 미설치",
      "도어 충격 시험 시 하부 슈가 홈에서 벗어나는 변형 발생 여부"
    ],
    failureHazard: "전동스쿠터, 손수레 또는 이용자가 출입문에 기댈 때 하부 가이드슈가 문턱 홈에서 이탈하여 문짝이 승강로 안쪽으로 밀려 열림. 개방된 승강로 개구부로 승객이 피트 바닥으로 추락하여 즉사하는 최악의 중대사고 발생.",
    correctiveAction: "마모된 가이드슈 즉각 신품 교체(권장 교체주기 2~3년), 이탈방지 핀 체결 토크 점검, 도어 하부 문턱 홈 일상 청소 및 이물질 제거 철저.",
    linkedCaseIds: [7, 9, 38, 45]
  },
  {
    id: "interphone",
    name: "비상통화장치 & 비상호출버튼",
    englishName: "Emergency Communication Device & Call Button",
    category: "EL",
    categoryLabel: "엘리베이터",
    location: "카 내부 조작반(COP), 기계실 및 외부 통합관제센터",
    icon: "📞",
    image: "images/2022/page_68.png",
    diagramNote: "카 내부 비상통화장치 정상 부착 및 통화 계통도 (사례집 도해도)",
    summary: "정전이나 고장으로 승객이 카에 갇혔을 때 외부 구조대 및 유지관리업체와 2자 이상 직접 통화하는 생명선",
    inspectionPoints: [
      "정전 또는 고장 정지 시 외부 유지관리업체/관제센터 2자 통화 자동 연결 불통",
      "카 내부 조작반 비상통화 스피커 음량 미달(통화 음압 65dB 이하) 및 잡음",
      "카 내부 인테리어 공사 보양재 또는 덧씌움으로 비상호출버튼·마이크 차단",
      "비상조명등(카 내부 예비전원 비상등) 1시간 이상 점등 유지 불량"
    ],
    failureHazard: "승강기 멈춤 시 승객이 외부와 연락이 두절되어 극심한 패닉에 빠짐. 밀폐 공간 공포로 인해 문을 억지로 벌리고 무리하게 탈출하려다 카와 벽 틈새 승강로로 추락 사망.",
    correctiveAction: "비상통화 배터리 및 유무선 통신선로 월간 정기 점검, 카 내부 보양재 설치 시 버튼 및 마이크 위치 개방 유지, 119 및 유지관리업체 자동 발신 번호 최신화.",
    linkedCaseIds: [18, 51]
  },
  {
    id: "door_interlock",
    name: "도어 인터록 & 출입문 안전스위치",
    englishName: "Landing Door Interlock & Safety Contact Switch",
    category: "EL",
    categoryLabel: "엘리베이터",
    location: "승강장문 상부 도어 행거 및 카 도어 개폐 장치",
    icon: "🔒",
    image: "images/2024/page_54.png",
    diagramNote: "출입문 인터록 접점 및 안전회로 구성도 (사례집 도해도)",
    summary: "출입문이 100% 완전히 닫히고 잠기지 않으면 모터 전원을 차단하여 카 출발을 원천 방지하는 안전장치",
    inspectionPoints: [
      "도어 인터록 잠금 물림 깊이(규정치 7mm 이상) 미달 및 후크 마모",
      "출입문 안전스위치 접점 마모, 산화 탄화로 인한 접촉 불량 및 간헐적 오작동",
      "고장 수리 시 작업자가 점검 편의를 위해 안전스위치를 임의 점퍼(단락)한 채 방치",
      "도어 클로저(자체 닫힘 장치) 스프링 장력 약화로 문 열림 상태 유지"
    ],
    failureHazard: "출입문이 열려 있는 상태에서 안전스위치가 닫힘으로 오인 판정되어 승강기가 급출발하는 '개문출발(문열림 출발)' 사고 발생. 승하차 중인 승객이 카 바닥과 승강장 문틀 사이에 끼여 신체 절단 및 압사.",
    correctiveAction: "도어 인터록 물림 깊이 및 접점 마모도 주기적 측정, 안전회로 임의 점퍼선 연결 절대 금지 및 검사 확인, 노후 인터록 스위치 적기 교체.",
    linkedCaseIds: [15, 23, 54, 55]
  },
  {
    id: "brake",
    name: "권상기 전자 브레이크 & 라이닝",
    englishName: "Traction Machine Electromagnetic Brake & Lining",
    category: "EL",
    categoryLabel: "엘리베이터",
    location: "기계실 권상기(트랙션 머신) 모터 축 및 제동 드럼/디스크",
    icon: "🛑",
    image: "images/2022/page_54.png",
    diagramNote: "제동기 전자석 코일, 스프링, 플런저 및 라이닝 구조도 (사례집 도해도)",
    summary: "모터 전원이 꺼졌을 때 스프링 압력으로 모터 축을 강력히 압착하여 승강기를 완벽히 정지시키는 제동 핵심 부품",
    inspectionPoints: [
      "브레이크 라이닝 두께 마모 한계(2mm 미만) 초과 및 편마모 발생",
      "라이닝 표면에 윤활유 또는 그리스 유입으로 인한 제동 마찰력 상실",
      "플런저(움직이는 철심 코어) 마모 및 고착으로 브레이크 미개방 또는 미체결",
      "브레이크 개방 감시장치(마이크로스위치) 미설치 또는 접점 불량"
    ],
    failureHazard: "제동력 상실 시 카 내부 승객 무게와 균형추 무게의 불균형으로 인해 카가 제어되지 않고 최상층 천장이나 최하층 바닥으로 초고속 급상승/추락 충돌. 탑승자 척추 골절 및 뇌출혈.",
    correctiveAction: "권장 교체주기(라이닝 3~5년) 준수, 브레이크 라이닝 두께 및 틈새(0.2~0.4mm) 게이지 측정, 오일 오염 세척 및 브레이크 개방 감시장치 설치 의무화.",
    linkedCaseIds: [23, 24, 94]
  },
  {
    id: "car_door_sensor",
    name: "카도어 다점빔 센서 & 세이프티슈",
    englishName: "Multi-Beam Photo Sensor & Safety Edge Shoe",
    category: "EL",
    categoryLabel: "엘리베이터",
    location: "카 출입문 좌우 측면 가장자리",
    icon: "👁️",
    image: "images/2022/page_64.png",
    diagramNote: "출입문 닫힘 안전센서 감지선 및 세이프티슈 작동도 (사례집 도해도)",
    summary: "출입문이 닫히는 도중 승객이나 물체가 감지되면 즉시 문을 반전 개방시키는 승객 보호 장치",
    inspectionPoints: [
      "적외선 다점빔 센서 렌즈 표면 먼지 오염 및 감지 블라인드 구간 발생",
      "얇은 물체(5mm 미만의 끈, 반려동물 목줄, 옷자락) 미감지 사각지대 존재",
      "세이프티슈 접촉 반전 스위치 고착 및 반응 지연",
      "도어 닫힘 대기시간(Dwell time)이 3초 미만으로 과도하게 짧아 승하차 여유 부족"
    ],
    failureHazard: "닫히는 문에 승객이 부딪혀 넘어지거나, 가방끈·목줄이 문에 끼인 채 카가 출발하여 승객이 문에 끌려가며 심각한 골절 및 손가락 절단 사고 발생.",
    correctiveAction: "적외선 다점빔 렌즈 주기적 알코올 세척, 감지 사각지대 없는 3D 광전센서 보강, 승강기 도어 대기시간 충분히(최소 3~5초) 설정.",
    linkedCaseIds: [10, 26, 35, 36, 37, 47]
  },
  {
    id: "governor",
    name: "과속조절기 (조속기) & 인장기",
    englishName: "Speed Governor & Tension Pulley",
    category: "EL",
    categoryLabel: "엘리베이터",
    location: "기계실 바닥(조속기 본체) 및 승강로 피트 바닥(인장추 풀리)",
    icon: "⚙️",
    image: "images/2022/page_56.png",
    diagramNote: "과속조절기 도르래, 원심추 및 피트 인장장치 구조도 (사례집 도해도)",
    summary: "카의 하강 또는 상승 속도가 정격속도를 15% 이상 초과하면 전원을 차단하고 비상정지장치를 물리적으로 기동시키는 속도 감시장치",
    inspectionPoints: [
      "과속조절기 원심 플라이웨이트 래칫爪 고착 및 스프링 탄성 불량",
      "조속기 트립 속도(작동 속도) 기준치 초과(정격속도의 115%~140% 범위 이탈)",
      "피트 바닥 인장추 풀리 유격 불량, 로프 이탈방지 핀 파손",
      "조속기 안전스위치 오작동 또는 전기 접점 결함"
    ],
    failureHazard: "카가 제어 불능으로 과속 추락할 때 비상정지장치를 작동시키지 못하여 카가 승강로 바닥에 직격 충돌하는 대형 참사 유발.",
    correctiveAction: "연 1회 조속기 트립 시험기 활용한 정밀 속도 측정, 회전축 베어링 급유 및 방청 처리, 인장추 풀리 평형 상태 및 스위치 정상 동작 확인.",
    linkedCaseIds: [42, 95]
  },
  {
    id: "safety_gear_buffer",
    name: "비상정지장치 & 피트 완충기",
    englishName: "Progressive Safety Gear & Pit Buffer",
    category: "EL",
    categoryLabel: "엘리베이터",
    location: "카 하부 프레임(비상정지장치) 및 승강로 피트 최하단(완충기)",
    icon: "🛡️",
    image: "images/2024/page_62.png",
    diagramNote: "피트 완충기 및 비상정지장치 쐐기 기구도 (사례집 도해도)",
    summary: "조속기 작동 시 가이드레일을 쐐기로 물어 카를 강제 정지시키는 비상정지장치와, 최하층 바닥 충격을 흡수하는 완충기",
    inspectionPoints: [
      "비상정지장치 쐐기(Wedge) 녹 발생, 편마모 및 가이드레일 간극 불량",
      "오일완충기 작동 오일 부족, 실린더 누유 및 플런저 복귀 불량",
      "피트 누수 및 침수로 인한 완충기 본체 부식 및 완충스위치 절연 파괴",
      "스프링 완충기 변형 및 충격 흡수 스트로크 부족"
    ],
    failureHazard: "비상 상황 시 가이드레일 제동 쐐기가 미끄러져 제동에 실패하거나, 피트 침수로 완충기가 고착되어 충격을 완화하지 못하고 탑승객 중상 또는 사망.",
    correctiveAction: "비상정지장치 링크 기구부 주기적 작동 점검, 피트 집수정 배수펌프 관리로 침수 원천 방지, 오일완충기 유량 및 규격 오일 보충.",
    linkedCaseIds: [12, 180]
  },
  {
    id: "control_panel",
    name: "제어반 & 인버터/PLC (전자회로기판)",
    englishName: "Elevator Control Panel & Inverter / PCB",
    category: "EL",
    categoryLabel: "엘리베이터",
    location: "기계실 내부 또는 승강로 벽체 제어함",
    icon: "💻",
    image: "images/2024/page_48.png",
    diagramNote: "제어반 인버터 및 PLC 회로 기구도 (사례집 도해도)",
    summary: "승강기의 운행 호출, 속도 제어, 문 개폐, 안전회로 감시를 총괄하는 두뇌",
    inspectionPoints: [
      "제어반 냉각팬 고장 및 방열판 먼지·분진 퇴적으로 인한 반도체 과열",
      "안전 릴레이 및 전자접촉기(MC) 접점 스파크 손상 및 용착(들러붙음)",
      "노후 전자회로기판(PCB) 콘덴서 누액, 납땜 크랙 및 에러 다발",
      "여름철 고온 다습 환경으로 인한 오동작 및 층간 급정지 유발"
    ],
    failureHazard: "기판 노후화로 신호 오작동이 발생하여 정지 위치를 지나 급정지하거나, 문열림 상태에서 주행 신호가 인가되어 개문출발 등 복합 중대사고 초래.",
    correctiveAction: "여름철 전 냉각팬 청소 및 교체, 제어반 내부 필터 먼지 제거, 15년 이상 노후 제어반은 전면 리모델링 또는 기판 주기적 교체.",
    linkedCaseIds: [16, 22, 24, 54]
  },
  {
    id: "wire_rope",
    name: "주권상 로프 & 권상 도르래 (쉬브)",
    englishName: "Main Suspension Wire Ropes & Sheave",
    category: "EL",
    categoryLabel: "엘리베이터",
    location: "기계실 권상기 도르래 및 승강로 전체",
    icon: "🪢",
    image: "images/2024/page_47.png",
    diagramNote: "주로프 권상 도르래 홈 및 로프 교체 안전도 (사례집 도해도)",
    summary: "카와 균형추를 매달아 권상기의 회전력을 마찰력으로 전달하여 승강기를 오르내리게 하는 강철 로프",
    inspectionPoints: [
      "로프 공칭 직경의 10% 이상 마모 및 단면 축소",
      "1개 꼬임 피치 내 소선 절단 수 규정치 초과(외층 소선 10% 이상 단선)",
      "도르래(쉬브) 홈 마모 불균형 및 적녹(내부 마모 가루) 발생",
      "로프 각 가닥 간 장력 편차(10% 초과 불균형)로 인한 특정 로프 과부하"
    ],
    failureHazard: "로프 마모로 인해 마찰력이 저하되면 도르래에서 로프가 헛도는 '슬립'이 발생하여 카 제어가 불가능해지며, 극단적인 경우 로프 파단으로 카 추락 사고 발생.",
    correctiveAction: "권장 교체주기(5~7년) 준수, 버니어캘리퍼스 측정, 로프 텐션 게이지로 장력 균등 조정, 쉬브 홈 재가공 또는 교체.",
    linkedCaseIds: [13, 41, 44]
  },
  {
    id: "level_difference",
    name: "승강기 단차 & 착상레벨 제어장치",
    englishName: "Elevator Floor Leveling Sensor & Threshold Step Difference",
    category: "EL",
    categoryLabel: "엘리베이터",
    location: "카 상·하부 착상센서(인덕터), 승강로 차광판(차폐판) 및 도어 실 문턱",
    icon: "📐",
    image: "images/2023/page_35.png",
    diagramNote: "착상 차폐판 이물질 및 카 바닥 단차(턱) 발생 구조도 (사례집 도해도)",
    summary: "카 바닥과 승강장 바닥의 수평 높이를 일치시켜 승하차 시 발걸림 및 넘어짐 사고를 원천 방지하는 착상 제어 시스템",
    inspectionPoints: [
      "카 바닥과 승강장 바닥 사이 착상 레벨 오차 규정치(±10mm 이하) 초과 및 단차 발생",
      "착상감지기(포토센서/근접스위치) 렌즈 이물질 오염 및 감지 불량",
      "승강로 내부 착상 차광판(베인/차폐판) 변형, 볼트 이완 및 이물질 끼임",
      "인버터 감속 패턴 오차 및 브레이크 제동 시점 편차로 인한 재착상(Re-leveling) 실패"
    ],
    failureHazard: "승강기가 층 바닥보다 높거나 낮게 멈춰 5~30cm 이상의 바닥 단차가 발생한 상태로 문이 열리면, 승하차하는 승객(특히 고령자, 어린이, 휠체어 이용자)이 문턱 턱에 발이 걸려 앞으로 고꾸라지며 안면·고관절 충돌 중상(전도 사고) 발생.",
    correctiveAction: "착상센서 렌즈 및 차광판 주변 주기적 이물질 제거 청소, 인버터 감속 거리 및 브레이크 타이밍 파라미터 정밀 튜닝, 재착상 안전회로 상시 점검, 문턱 단차 허용오차(±5mm 이내) 정밀 유지관리.",
    linkedCaseIds: [11, 21, 48]
  },
  {
    id: "comb",
    name: "에스컬레이터 콤 & 콤 플레이트",
    englishName: "Escalator Comb & Comb Plate",
    category: "ES",
    categoryLabel: "에스컬레이터",
    location: "에스컬레이터 및 무빙워크 상·하부 승강장 진입·퇴출부",
    icon: "🪮",
    image: "images/2024/page_15.png",
    diagramNote: "콤 플레이트 빗살 맞물림 및 틈새 규격도 (사례집 도해도)",
    summary: "디딤판 홈과 맞물려 승객의 발이나 소지품이 기계 내부로 빨려 들어가지 않도록 분리해 주는 빗살 모양 안전장치",
    inspectionPoints: [
      "콤 빗살 파열 및 결손(연속 2개 이상 또는 전체 3개 이상 부러짐)",
      "콤과 디딤판 홈 사이 맞물림 깊이(규정치 4mm 이상) 미달",
      "콤 고정 볼트 풀림으로 인한 디딤판과의 간섭 및 소음 발생",
      "콤에 이물질이 끼였을 때 멈추는 콤스위치(Comb safety switch) 미작동"
    ],
    failureHazard: "풀린 신발끈, 고무 크록스, 옷자락이 파손된 콤 틈새에 말려들어가 발가락 협착 절단 사고 발생. 콤 볼트 풀림 시 디딤판과 충돌하여 스텝이 튀어 오르며 급정지해 승객 수십 명 연쇄 전도.",
    correctiveAction: "빗살 1개라도 파손 시 즉시 운행 중지 후 콤 세그먼트 교체, 콤 볼트 풀림방지 너트 체결 및 마킹 확인, 콤 안전스위치 작동 시험 실시.",
    linkedCaseIds: [2, 6, 25, 31]
  },
  {
    id: "skirt_guard",
    name: "스커트가드 & 안전솔 디플렉터",
    englishName: "Skirt Guard & Safety Deflector Brush",
    category: "ES",
    categoryLabel: "에스컬레이터",
    location: "에스컬레이터 디딤판 좌우 측면 고정 벽체",
    icon: "🖌️",
    image: "images/2024/page_16.png",
    diagramNote: "스커트가드 틈새 및 디플렉터 안전솔 설치도 (사례집 도해도)",
    summary: "움직이는 디딤판과 고정된 측면 벽체 사이의 틈새로 승객의 신발이나 옷자락이 끼이지 않도록 차단하는 안전장치",
    inspectionPoints: [
      "스커트가드와 디딤판 사이 틈새(한쪽 4mm 이하, 양쪽 합 7mm 이하) 초과",
      "스커트 디플렉터(끼임방지 안전솔 브러시) 마모, 결손 또는 미설치",
      "스커트가드 패널 체결 볼트 이완으로 하중 시 벌어짐 현상 발생",
      "스커트가드 스위치(끼임 감지 비상정지 스위치) 작동 불량"
    ],
    failureHazard: "어린이들이 안전선 밖에 서서 신발을 스커트가드에 밀착할 경우, 마찰력에 의해 고무 신발이 틈새로 말려들어가 발가락 골절 및 살점 파열 중상 초래.",
    correctiveAction: "틈새 게이지 측정 및 스커트가드 조정, 안전솔(디플렉터) 솔 빠짐 즉시 교체, 노란색 디딤판 안전선 도색 선명도 유지.",
    linkedCaseIds: [3, 33, 39]
  },
  {
    id: "handrail",
    name: "핸드레일 (손잡이) & 구동 롤러",
    englishName: "Handrail & Drive Mechanism",
    category: "ES",
    categoryLabel: "에스컬레이터",
    location: "에스컬레이터 및 무빙워크 양측 상단 이동 손잡이",
    icon: "🖐️",
    image: "images/2023/page_57.png",
    diagramNote: "핸드레일 장력 조절기 및 구동 롤러 계통도 (사례집 도해도)",
    summary: "승객이 탑승 중 균형을 잃지 않도록 디딤판과 동일한 속도로 움직여 주는 손잡이",
    inspectionPoints: [
      "핸드레일 속도와 디딤판 속도 편차(0 ~ +2% 규정치 이탈, 핸드레일이 느림)",
      "핸드레일 장력 느슨함(147N 하중 시 30mm 이상 들림) 및 내피 갈라짐",
      "구동 롤러 마모 및 구동 체인 늘어남",
      "핸드레일 인입구 안전스위치(Finger guard) 작동 불량"
    ],
    failureHazard: "손잡이가 디딤판보다 느리거나 갑자기 멈추면(속도 편차), 손잡이를 잡고 있던 승객의 상체가 뒤로 젖혀지며 균형을 잃고 넘어져 뒤따르던 승객 10여 명이 도미노처럼 연쇄 전도 골절.",
    correctiveAction: "핸드레일 속도 타코미터 측정, 텐션 롤러 장력 조정, 구동 체인 링크 마모 점검, 인입구 손끼임 방지 보호대 틈새 점검.",
    linkedCaseIds: [1, 17, 27, 46, 50, 52, 53]
  },
  {
    id: "anti_reversal",
    name: "구동체인 & 역주행 방지장치 (보조제동기)",
    englishName: "Drive Chain & Anti-Reversal Auxiliary Brake",
    category: "ES",
    categoryLabel: "에스컬레이터",
    location: "에스컬레이터 상부 트러스 기계실 구동부",
    icon: "🔄",
    image: "images/2024/page_45.png",
    diagramNote: "역주행 방지 보조제동기 및 구동체인 안전스위치도 (사례집 도해도)",
    summary: "구동체인이 끊어지거나 모터 동력이 상실되었을 때 에스컬레이터가 거꾸로 밀려 내려가는 역주행을 물리적으로 차단하는 제동기",
    inspectionPoints: [
      "역주행 방지장치(보조제동기) 미설치 또는 기계적 래칫 작동 불량",
      "주 구동체인 늘어남(신장률 2% 초과) 및 체인 안전스위치 간극 불량",
      "보조제동기 라이닝 마모 및 제동 토크 부족",
      "에스컬레이터 무부하/과부하 역주행 검출 속도 센서 불량"
    ],
    failureHazard: "출퇴근 시간 다중밀집 상태에서 상승하던 에스컬레이터가 구동체인 파손 등으로 갑자기 역주행하면, 수십 명의 탑승객이 아래로 쏟아져 떨어지며 압사 및 대형 인명피해 발생.",
    correctiveAction: "역주행 방지 보조제동기 주기적 하중 작동 시험, 구동체인 링크 연신율 측정 및 텐셔너 점검, 다중밀집 역사 우선 교체 및 보강.",
    linkedCaseIds: [20, 40, 43, 50]
  }
];

if (typeof module !== 'undefined') {
  module.exports = { PARTS_DATA, DEFAULT_PARTS_MAPPING };
}
