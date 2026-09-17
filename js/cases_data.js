// 2024 승강기 사고 사례집 데이터셋 (한국승강기안전공단 2024 발간)
const CASES_DATA = [
  {
    id: 1,
    page: 14,
    bookPage: 16,
    image: "images/page_14.png",
    title: "에스컬레이터 탑승 중 몸의 중심을 잃고 넘어진 사고",
    elevatorType: "에스컬레이터",
    elevatorCategory: "ES",
    accidentType: "전도",
    casualty: "중상 3건",
    severity: "중상",
    causeType: "이용자 과실",
    similarCount: "2건",
    summary: "탑승 시 노란 안전선 디딤판 끝단을 밟거나 손잡이를 잡지 않아 천이구간에서 중심을 잃고 전도",
    description: [
      "피해자가 에스컬레이터 이용 중 넘어져 발생한 사고",
      "① 탑승 시 노란 안전선 안쪽이 아닌 디딤판 끝단을 밟고 있다가 단차에 의해 넘어짐",
      "② 불안전한 자세로 손잡이를 잡고 있지 않거나 내리던 중 몸의 중심을 잃고 넘어짐",
      "③ 수평구간에서 경사구간으로 변하는 천이구간에서 몸의 중심을 잃고 넘어짐"
    ],
    cause: [
      "노란 안전선 안에 탑승하지 않아 수평구간에서 경사구간으로 바뀔 때 중심을 잃음",
      "상승 운행하는 에스컬레이터에서 오른손에 지팡이를 짚고 있어 손잡이를 정상적으로 잡기 어려운 상태로 올라가던 중 전도",
      "왼손에 무거운 물건을 들고 있어 손잡이를 잡지 못하고 운행 중 몸의 중심을 상실"
    ],
    prevention: [
      "관리주체: 이용자가 안전하게 에스컬레이터를 이용할 수 있도록 안내방송을 주기적으로 실시하고 상·하부 승강장 주변 안전요원 배치 등 현장 안전관리 강화",
      "이용자: 에스컬레이터 탑승 시 반드시 손잡이를 잡고 노란 안전선 안에 탑승하며, 걷거나 뛰지 않고 어린이·노약자는 보호자와 함께 탑승하거나 엘리베이터 이용"
    ],
    tags: ["에스컬레이터", "전도", "이용자과실", "손잡이미착용", "노약자"]
  },
  {
    id: 2,
    page: 15,
    bookPage: 17,
    image: "images/page_15.png",
    title: "운동화 끈이 하부 콤에 끼여 몸의 중심을 잃고 넘어진 사고",
    elevatorType: "에스컬레이터",
    elevatorCategory: "ES",
    accidentType: "끼임",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "이용자 과실",
    similarCount: "-",
    summary: "풀린 운동화 끈이 에스컬레이터 하부 콤 틈새에 끼이면서 내리는 순간 중심을 잃고 전도",
    description: [
      "피해자가 에스컬레이터에 탑승하여 내려가던 중 풀린 신발 끈이 하부 콤(Comb)에 걸려 넘어진 사고"
    ],
    cause: [
      "피해자의 왼쪽 신발 끈이 풀어진 상태로 탑승하여 하부 승강장으로 내리던 중 풀어진 신발 끈이 콤 틈새에 끼이면서 몸의 중심을 잃고 넘어짐"
    ],
    prevention: [
      "이용자: 에스컬레이터 이용 시 콤과 스텝 및 스커트가드 틈새에 신발 끈, 옷자락 등이 끼이지 않도록 주의",
      "관리주체: 신발 끈 등이 콤과 스텝에 끼일 위험성을 알리는 안전표지 부착 및 안전이용 홍보 강화, 일상점검 시 콤 빗살 파손 확인 즉시 운행정지 및 교체"
    ],
    tags: ["에스컬레이터", "끼임", "하부콤", "신발끈", "이용자과실"]
  },
  {
    id: 3,
    page: 16,
    bookPage: 18,
    image: "images/page_16.png",
    title: "에스컬레이터 디딤판과 스커트가드 사이 신발이 끼여 발생한 사고",
    elevatorType: "에스컬레이터",
    elevatorCategory: "ES",
    accidentType: "끼임",
    casualty: "중상 3건",
    severity: "중상",
    causeType: "이용자 과실",
    similarCount: "2건",
    summary: "어린이 등이 안전선 밖 스커트가드에 발을 밀착하여 고무신발(크록스 등)이 틈새에 말려들어 끼임",
    description: [
      "피해자가 하강 운행하는 에스컬레이터에 탑승하여 내려가던 중 우측 신발이 디딤판과 스커트가드 사이에 끼이며 발생한 사고"
    ],
    cause: [
      "에스컬레이터 탑승 중 디딤판의 노란 안전선 안에 탑승하지 않고 스커트가드에 신발을 접촉시키며 운행되던 중 틈새로 빨려 들어가 끼임"
    ],
    prevention: [
      "이용자: 디딤판의 노란 안전선 안에 탑승하는 준수사항 준수, 어린이·노약자는 보호자의 손을 잡고 동반 탑승",
      "관리주체: 노란 안전선 준수 및 어린이 보호자 동반 안내방송 및 홍보, 행사·집중시간대 상하부 안전요원 배치"
    ],
    tags: ["에스컬레이터", "끼임", "스커트가드", "어린이", "안전선미준수"]
  },
  {
    id: 4,
    page: 17,
    bookPage: 19,
    image: "images/page_17.png",
    title: "에스컬레이터에 유모차와 같이 탑승하여 발생한 사고",
    elevatorType: "에스컬레이터",
    elevatorCategory: "ES",
    accidentType: "전도",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "이용자 과실",
    similarCount: "-",
    summary: "유모차에 짐을 싣고 에스컬레이터 진입 중 경사구간에서 전복되며 후속 탑승자와 연쇄 전도",
    description: [
      "유모차에 짐을 싣고 에스컬레이터에 탑승하여 올라가던 중 수평구간에서 경사구간으로 전환되며 유모차의 무게중심이 뒤로 기울어져 전복, 뒤따르던 피해자와 함께 넘어진 사고"
    ],
    cause: [
      "수평부에서 경사부로 전환되는 구간에서 짐이 실린 유모차의 무게중심이 뒤쪽으로 쏠려 앞선 이용자가 중심을 잃고 전도되었고, 뒤따르던 승객도 함께 연쇄 전도"
    ],
    prevention: [
      "이용자: 유모차, 쇼핑카트, 손수레 등을 소지한 경우 에스컬레이터 탑승 절대 금지, 반드시 엘리베이터 이용",
      "관리주체: 에스컬레이터 입구에 유모차·손수레 진입 금지 차단봉 및 경고 표지 설치, 안내방송 지속 송출"
    ],
    tags: ["에스컬레이터", "전도", "유모차탑승금지", "연쇄전도", "이용자과실"]
  },
  {
    id: 5,
    page: 18,
    bookPage: 20,
    image: "images/page_18.png",
    title: "수평보행기(무빙워크)에 탑승하여 걸어가던 중 몸의 중심을 잃고 넘어진 사고",
    elevatorType: "수평보행기 (무빙워크)",
    elevatorCategory: "MW",
    accidentType: "전도",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "이용자 과실",
    similarCount: "-",
    summary: "우천 시 젖은 신발로 경사형 무빙워크 위를 손잡이 없이 걷다가 미끄러져 전도",
    description: [
      "피해자가 하강 운행하는 경사형 무빙워크에 탑승하여 걸어서 내려가던 중 몸의 중심을 잃고 넘어진 사고"
    ],
    cause: [
      "손잡이를 잡지 않고 경사형 수평보행기 위에서 걸어서 이동하였고, 우천으로 젖은 신발 바닥이 미끄러워 균형을 잃고 미끄러져 전도"
    ],
    prevention: [
      "이용자: 경사형 무빙워크 이용 시 반드시 손잡이를 잡고 서서 이용하며 걷거나 뛰지 않기",
      "관리주체: 비·눈 내릴 때 출입구 바닥 흡수매트 설치, 수시 물기 제거 및 '미끄럼 주의' 입간판 배치"
    ],
    tags: ["무빙워크", "전도", "보행금지", "우천미끄럼", "이용자과실"]
  },
  {
    id: 6,
    page: 19,
    bookPage: 21,
    image: "images/page_19.png",
    title: "쇼핑카트 뒷바퀴가 콤에 걸리면서 몸의 중심을 잃고 넘어진 사고",
    elevatorType: "수평보행기 (무빙워크)",
    elevatorCategory: "MW",
    accidentType: "전도",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "이용자 과실",
    similarCount: "-",
    summary: "무빙워크 출구에서 쇼핑카트를 힘껏 밀어내지 않아 뒷바퀴가 콤에 걸리며 팔레트 밀림으로 전도",
    description: [
      "쇼핑카트를 가지고 무빙워크에 탑승하여 내려가던 중 출구에서 카트 뒷바퀴가 하부 콤에 걸려 빠져나가지 못하고 카트와 함께 넘어진 사고"
    ],
    cause: [
      "하부 승강장 출구 진출 시 쇼핑카트를 앞으로 밀어주지 않아 바퀴가 콤에 걸렸고, 팔레트는 계속 이동하여 뒤에서 밀리며 중심을 잃음"
    ],
    prevention: [
      "이용자: 쇼핑카트를 가지고 무빙워크를 이용하는 경우 출구 도착 전 두 손으로 카트를 잡고 앞으로 힘껏 밀어내기",
      "관리주체: 출구 안내문 부착 및 혼잡 시간대 안내요원 배치, 카트 바퀴 및 콤 마모 상태 정기 점검"
    ],
    tags: ["무빙워크", "전도", "쇼핑카트", "하부콤", "마트안전"]
  },
  {
    id: 7,
    page: 20,
    bookPage: 22,
    image: "images/page_20.png",
    title: "견인차 조작 실수로 승강장 문에 충돌해 피트로 추락한 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "추락",
    casualty: "사망 1건",
    severity: "사망",
    causeType: "이용자 과실",
    similarCount: "-",
    summary: "전동 견인차로 화물 운반 중 조작 미숙으로 닫힌 승강장문에 돌진 충돌, 도어 이탈로 카 상부 추락",
    description: [
      "피해자가 전동 견인차에 탑승하여 화물을 운반하던 중 조작 실수로 승강장 문에 고속 충돌, 승강장 도어가 이탈되면서 카 상부/피트로 추락하여 사망한 중대사고"
    ],
    cause: [
      "전동 견인차 운전자가 브레이크 조작 미숙 또는 가속 페달 오조작으로 승강장문과 충돌, 설계 기준 이상의 충격량으로 도어 슈(Door Shoe)가 파손·이탈되어 승강로 개방"
    ],
    prevention: [
      "관리주체: 화물용 승강장 앞 전동차 정지선 및 방호 범퍼(볼라드/스토퍼) 설치, 운전자 대상 안전교육 실시",
      "이용자: 화물 운반 차량은 승강장문과 충분한 안전거리를 유지하고 정지 후 승강기 호출 조작"
    ],
    tags: ["엘리베이터", "추락", "사망", "전동견인차", "도어충돌이탈"]
  },
  {
    id: 8,
    page: 21,
    bookPage: 23,
    image: "images/page_21.png",
    title: "탑승이 금지된 소형 화물용 엘리베이터에 탑승하여 발생한 사고",
    elevatorType: "소형화물용 엘리베이터",
    elevatorCategory: "EL",
    accidentType: "추락",
    casualty: "사망 1건",
    severity: "사망",
    causeType: "이용자 과실",
    similarCount: "-",
    summary: "탑승 금지된 덤웨이터/화물 리프트에 사람이 임의 탑승하여 화물 적재 중 틈새(380mm)로 추락",
    description: [
      "사고 현장 근로자가 승강장에서 카 내부로 화물을 옮기던 중 카 바닥과 승강로 벽 사이 틈새(약 380mm)로 빠져 피트로 추락하여 사망"
    ],
    cause: [
      "소형 화물용 엘리베이터(탑승 금지 설비)에 사람이 임의로 탑승하여 화물 랙(Rack)을 싣던 중, 승강로 벽과 카 바닥 사이의 넓은 유격으로 실족 추락"
    ],
    prevention: [
      "관리주체: 소형 화물용 엘리베이터 전면 '인명 탑승 절대 금지' 경고 표지 부착, 출입 개구부 방호장치 설치",
      "이용자: 화물용 리프트 및 덤웨이터 내부로 신체 진입 및 동승 절대 금지"
    ],
    tags: ["소형화물용", "추락", "사망", "탑승금지", "승강로틈새"]
  },
  {
    id: 9,
    page: 22,
    bookPage: 24,
    image: "images/page_22.png",
    title: "양방향 출입구 엘리베이터에서 출입문에 기대고 있다가 문이 열려 전도된 사고",
    elevatorType: "엘리베이터 (양방향 관통형)",
    elevatorCategory: "EL",
    accidentType: "전도",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "이용자 과실",
    similarCount: "-",
    summary: "앞뒤 양쪽에 문이 있는 엘리베이터에서 반대편 문에 몸을 기대고 있다가 지하층에서 열리며 전도",
    description: [
      "출입문이 전·후면 2개인 관통형 엘리베이터에서 반대편 도어에 몸을 기댄 채 탑승 중, 목적층 도착 후 기댄 문이 갑자기 열리며 승강장 바닥으로 넘어진 사고"
    ],
    cause: [
      "탑승 방향 반대편 문에 기대어 서 있던 중, 해당 층의 출입문이 개방되자 지지점을 잃고 뒤로 넘어짐"
    ],
    prevention: [
      "관리주체: 관통형 승강기 내 층별 열림 방향 표시등 및 '기대지 마시오' 경고 안내 방송 송출",
      "이용자: 승강기 출입문에 기대지 말고 손잡이(핸드레일)를 잡고 중심 유지"
    ],
    tags: ["엘리베이터", "전도", "관통형승강기", "문기댐금지", "이용자과실"]
  },
  {
    id: 10,
    page: 23,
    bookPage: 25,
    image: "images/page_23.png",
    title: "닫히는 출입문과 충돌하여 발생한 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "충돌/전도",
    casualty: "중상 5건",
    severity: "중상",
    causeType: "이용자 과실",
    similarCount: "3건",
    summary: "문이 닫히는 순간 무리하게 탑승하거나 내리려다 도어 센서 사각지대에서 충돌 후 전도",
    description: [
      "엘리베이터에 급하게 탑승하거나 하차하던 중 닫히는 출입문에 부딪히거나 끼이면서 넘어져 골절 등 중상을 입은 다수 사고"
    ],
    cause: [
      "문닫힘 안전장치(멀티빔 센서)의 사각지대로 진입하거나 신체 일부가 닫히는 도어와 직접 충돌하여 균형 상실"
    ],
    prevention: [
      "이용자: 닫히는 문에 손을 넣거나 무리하게 뛰어들지 말고 다음 승강기를 기다리며, 열림 버튼을 누른 상태에서 승하차",
      "관리주체: 다중이용 승강기 도어 열림 대기시간 연장 설정 및 비접촉식 감지센서(멀티빔) 성능 점검"
    ],
    tags: ["엘리베이터", "충돌", "전도", "도어끼임", "무리한탑승"]
  },
  {
    id: 11,
    page: 24,
    bookPage: 26,
    image: "images/page_24.png",
    title: "엘리베이터 도착 전 문을 강제 개방하여 발생한 단차 전도 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "전도",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "이용자 과실",
    similarCount: "-",
    summary: "승강기 하강 중 카가 급정지하자 탑승자가 손으로 문을 강제로 열고 내리다 바닥 단차에 걸려 전도",
    description: [
      "탑승 중 카가 급정지하자 승객이 손으로 출입문을 강제로 벌려 열고 층간 단차가 발생한 상태에서 내리다가 넘어져 중상"
    ],
    cause: [
      "도어 모터의 닫힘 토크 설정이 낮아 손으로 강제 개방이 가능했고, 승강장 바닥과 카 바닥 간 레벨 차이를 인지하지 못하고 탈출 시도"
    ],
    prevention: [
      "이용자: 승강기 갇힘 시 절대 문을 강제로 열지 말고 비상통화버튼(인터폰)으로 구조 요청 후 대기",
      "유지관리업체: 도어 개폐 토크 적정치 유지 및 갇힘 방지 제어 로직 철저 점검"
    ],
    tags: ["엘리베이터", "전도", "임의개방", "갇힘사고", "단차발생"]
  },
  {
    id: 12,
    page: 25,
    bookPage: 27,
    image: "images/page_25.png",
    title: "승강기 단독 작업으로 발생한 피트 내 협착 사망 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "협착",
    casualty: "사망 1건",
    severity: "사망",
    causeType: "작업자 과실",
    similarCount: "-",
    summary: "안전관리자 통보 없이 단독으로 피트에 진입하여 점검 중 자동 하강하는 카와 사다리 사이에 협착",
    description: [
      "승강기 설치 작업자가 건물 관계자에게 통보하지 않고 단독으로 승강로 피트에 진입하여 작업 중, 자동 모드로 하강하는 카와 이동식 사다리 사이에 끼여 사망"
    ],
    cause: [
      "2인 1조 작업 원칙 미준수, 점검 운전 모드(수동) 전환 미실시, 피트 비상정지스위치 미작동 상태에서 임의 작업"
    ],
    prevention: [
      "설치·유지관리업체: 승강로 피트 작업 시 반드시 2인 1조 근무 준수, 카 하부 비상정지스위치 즉시 작동 및 점검 모드 전환",
      "작업자: 관리주체 사전 승인 및 출입 통제선 설치 후 작업 개시"
    ],
    tags: ["엘리베이터", "협착", "사망", "작업자과실", "2인1조미준수", "피트진입"]
  },
  {
    id: 13,
    page: 26,
    bookPage: 28,
    image: "images/page_26.png",
    title: "기존 양중고리 테스트 없이 재사용하다 카와 함께 추락한 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "추락",
    casualty: "사망 1건",
    severity: "사망",
    causeType: "작업자 과실",
    similarCount: "-",
    summary: "노후 빌딩 엘리베이터 교체공사 중 인장강도 테스트 없이 20년 된 건축용 이형철근 양중고리를 재사용하다 파단 추락",
    description: [
      "승강기 교체 공사 중 승강로 기계실 천장의 기존 양중고리에 호이스트를 걸고 작업하던 중 양중고리가 파단되어 카 내 작업자가 카와 함께 피트로 추락하여 사망"
    ],
    cause: [
      "준공 후 20년 이상 경과한 비공인 건축 부재(이형철근) 양중고리를 비파괴/인장 하중 테스트 없이 재사용, 안전대 구명줄 미체결"
    ],
    prevention: [
      "작업업체: 노후 양중고리 사용 전 구조안전진단 및 비파괴·하중 테스트 필수 이행, 안전대 부착 설비 설치",
      "작업자: 2m 이상 승강로 내 고소 작업 시 반드시 구명줄에 안전대 체결"
    ],
    tags: ["엘리베이터", "추락", "사망", "작업자과실", "양중고리파단", "교체공사"]
  },
  {
    id: 14,
    page: 27,
    bookPage: 29,
    image: "images/page_27.png",
    title: "승강로 검사 중 균형추와 레일 브라켓 사이에 손이 끼인 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "끼임",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "작업자 과실",
    similarCount: "-",
    summary: "카 상부에서 균형추 점검 중 승강기 저속 운행 시 레일 브라켓과의 협소 공간에 손이 협착",
    description: [
      "승강기 검사자가 카 상부에서 균형추 상태를 육안 검사하던 중 카가 점검속도로 하강(균형추는 상승)하면서 균형추 상부와 고정 브라켓 사이에 손이 끼임"
    ],
    cause: [
      "운행 중 위험 부위 접근 금지 수칙 미준수, 점검용 조명 불량 상태에서 시야 미확보 및 안전거리 미확보"
    ],
    prevention: [
      "검사기관: 카 상부 검사 시 이동 중 회전체·대향체(균형추) 접근 금지 및 충분한 조명기구 확보",
      "작업자: 카 운전 조작자와 검사자 간 구호 복창 및 완벽한 상호 신호체계 확립"
    ],
    tags: ["엘리베이터", "끼임", "작업자과실", "균형추", "카상부작업"]
  },
  {
    id: 15,
    page: 28,
    bookPage: 30,
    image: "images/page_28.png",
    title: "카 상부 고장수리 중 승강장문 닫힘으로 카 상승 후 추락 사망 사고 (1)",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "추락",
    casualty: "사망 1건",
    severity: "사망",
    causeType: "관리주체 과실",
    similarCount: "-",
    summary: "카 상부 진입 중 승강장문이 닫히며 자동운전 상태인 카가 급상승, 승강로 H빔에 부딪혀 피트로 추락",
    description: [
      "유지관리 기사가 3층 승강장에서 약 1.8m 아래 카 상부로 진입하던 중 승강장문이 닫히며 자동운전 모드로 카가 상승, 승강로 철골 빔에 충돌 후 피트로 추락 사망"
    ],
    cause: [
      "카 상부 점검스위치(수동 모드)를 먼저 전환하지 않은 채 자동운전 상태에서 카 상부로 무리하게 뛰어내림, 문이 닫히자 호출 등록으로 카 자동 상승"
    ],
    prevention: [
      "작업자: 카 상부 진입 전 승강장 도어 문열림 고정(도어 블록), 카 상부 비상정지스위치 즉시 정지 위치 설정",
      "유지관리업체: 카 상부 진입 안전작업 표준절차(SOP) 재교육 및 2인 1조 작업 의무화"
    ],
    tags: ["엘리베이터", "추락", "사망", "카상부", "자동운전상승", "관리과실"]
  },
  {
    id: 16,
    page: 29,
    bookPage: 31,
    image: "images/page_29.png",
    title: "카 상부 이동케이블 점검 중 안전대 미착용으로 추락 사망 사고 (2)",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "추락",
    casualty: "사망 1건",
    severity: "사망",
    causeType: "작업자 과실",
    similarCount: "1건",
    summary: "조도가 불량한 카 상부에서 안전대 없이 이동케이블 확인 중 케이블 하중 분리로 지하 피트 추락",
    description: [
      "기사가 카 상부에서 노후 이동케이블 결속 작업을 하던 중 커넥터 연결부가 분리되며 케이블 무게에 끌려 지하 2층 피트로 추락하여 사망"
    ],
    cause: [
      "작업선 조도 불량, 안전벨트(안전대) 미체결, 무거운 이동케이블의 자중을 지지할 보조 로프 미설치"
    ],
    prevention: [
      "작업자: 카 상부 작업 시 반드시 승강로 내 설치된 안전로프에 안전대 걸이 체결",
      "관리업체: 중량물 취급 시 고정 지지구 선설치 및 작업 전 위험성 평가 실시"
    ],
    tags: ["엘리베이터", "추락", "사망", "작업자과실", "안전대미착용", "이동케이블"]
  },
  {
    id: 17,
    page: 30,
    bookPage: 32,
    image: "images/page_30.png",
    title: "정지된 손잡이로 인해 에스컬레이터 이용 중 발생한 전도 사고",
    elevatorType: "에스컬레이터",
    elevatorCategory: "ES",
    accidentType: "전도",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "관리주체 과실",
    similarCount: "-",
    summary: "핸드레일 구동계 고장으로 손잡이가 멈춘 채 스텝만 움직이는 에스컬레이터를 방치하여 승객 전도",
    description: [
      "핸드레일이 정지된 에스컬레이터에 승객이 탑승하여 손잡이를 잡았으나 스텝만 이동하여 상체와 하체의 속도차로 균형을 잃고 전도, 뒤따르던 승객 부축 중 요추 골절"
    ],
    cause: [
      "손잡이 정지 스위치 불량 또는 고장 상태에서 운행 정지 및 LOTO(잠금장치) 조치를 하지 않고 임의로 기기를 가동 방치"
    ],
    prevention: [
      "관리주체: 에스컬레이터 주요 부품 결함 발생 시 즉시 전원 차단, 차단 펜스 설치 및 운행 정지 표지판 부착",
      "유지보수업체: 핸드레일 속도 감응 센서 및 동기화 장치 매월 정밀 점검"
    ],
    tags: ["에스컬레이터", "전도", "관리주체과실", "손잡이정지", "핸드레일고장"]
  },
  {
    id: 18,
    page: 31,
    bookPage: 33,
    image: "images/page_31.png",
    title: "비전문가의 임의 구출활동으로 발생한 승강로 피트 추락 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "추락",
    casualty: "사망 1건",
    severity: "사망",
    causeType: "관리주체 과실",
    similarCount: "-",
    summary: "갇힌 승객을 경비원이 비상삼각열쇠로 직접 구출한 뒤 잔류 물품을 꺼내려다 승강로 틈새로 추락",
    description: [
      "10층에서 카가 정지해 승객이 갇히자 건물 경비원이 삼각열쇠로 도어를 강제 개방하여 승객을 구출한 후, 카 내 남겨진 음식물 쓰레기를 꺼내려다 카 바닥과 승강장 사이 틈으로 빠져 지하 5층 피트로 추락 사망"
    ],
    cause: [
      "승강기 안전관리 자격이 없는 비전문가가 임의로 승강장문 비상열쇠를 사용해 개방하였고, 카의 레벨링이 맞지 않은 상태에서 승강로 추락 위험 방치"
    ],
    prevention: [
      "관리주체: 승강기 갇힘 시 자체 구출 절대 금지, 119구조대 및 유지관리업체 전문 기술자 호출 필수",
      "안전관리: 비상 삼각열쇠는 시건장치된 보관함에 보관하고 권한 없는 자의 접근 원천 차단"
    ],
    tags: ["엘리베이터", "추락", "사망", "비전문가구출", "관리주체과실", "삼각열쇠"]
  },
  {
    id: 19,
    page: 32,
    bookPage: 34,
    image: "images/page_32.png",
    title: "비전문가의 승강로 무단 진입(CCTV 작업)으로 발생한 협착 사망 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "협착",
    casualty: "사망 1건",
    severity: "사망",
    causeType: "작업자 과실",
    similarCount: "-",
    summary: "CCTV 설치 기사가 승강기 기술자 입회 없이 카 상부에 탑승하여 배선 작업 중 카가 자동 상승하여 협착",
    description: [
      "CCTV 설치업체 작업자가 1층에 정지된 엘리베이터 카 상부에 올라가 케이블 배선 작업을 하던 중, 카가 다른 층 호출에 의해 자동 상승하여 카 상부와 2층 문턱 구조물 사이에 끼여 사망"
    ],
    cause: [
      "승강기 전문기술자 입회 없이 비전문가가 카 상부에 무단 탑승, 카 상부 점검 스위치를 수동(점검) 모드로 전환하지 않고 자동운전 상태 방치"
    ],
    prevention: [
      "관리주체: 비전문가가 임의로 승강로 및 카 상부에 접근할 수 없도록 비상키 관리 철저, CCTV 등 부대작업 시 유지관리업체 필수 입회",
      "시행사: 카 상부 전원 차단 및 운행 정지 확인 후 작업 승인"
    ],
    tags: ["엘리베이터", "협착", "사망", "CCTV작업", "비전문가", "작업자과실"]
  },
  {
    id: 20,
    page: 33,
    bookPage: 35,
    image: "images/page_33.png",
    title: "점검용 덮개를 안전조치 없이 열어둔 채 이동하여 발생한 추락 사고",
    elevatorType: "에스컬레이터",
    elevatorCategory: "ES",
    accidentType: "추락",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "유지관리업체 과실",
    similarCount: "-",
    summary: "에스컬레이터 하부 트러스 점검 덮개를 안전펜스 없이 개방해 둔 채 자리를 비워 보행자가 개구부 추락",
    description: [
      "유지관리업체 기사가 고장 수리를 위해 하부 점검용 바닥 덮개(플레이트)를 열어둔 상태에서 안전 가림막이나 안내표지 없이 이동하자, 지나가던 보행자가 개구부로 발이 빠져 추락"
    ],
    cause: [
      "작업 구역 주변에 안전 차단 펜스 및 작업 안내 표지판을 설치하지 않고 개구부를 무방비 상태로 방치"
    ],
    prevention: [
      "유지관리업체: 점검 덮개 개방 시 즉시 4면 안전 차단 펜스 설치 및 작업 감시원 배치",
      "작업절차: 작업자가 잠시 자리를 비울 경우 덮개를 원상 복구하거나 견고한 안전 덮개 임시 체결"
    ],
    tags: ["에스컬레이터", "추락", "유지관리과실", "점검덮개개방", "안전펜스미설치"]
  },
  {
    id: 21,
    page: 34,
    bookPage: 36,
    image: "images/page_34.png",
    title: "급정지로 인한 재착상 단차로 하차 중 넘어진 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "전도",
    casualty: "중상 2건",
    severity: "중상",
    causeType: "유지관리업체 과실",
    similarCount: "1건",
    summary: "하강 운행 중 제어 위치 오차로 카가 3층에서 멈췄으나 바닥 단차가 크게 발생, 문이 열려 하차 중 전도",
    description: [
      "엘리베이터가 하강 운행 중 비정상 위치 제어로 층 바닥보다 높게 정지하였으나 출입문이 열렸고, 내리던 승객들이 승강장과 카 바닥 사이 큰 턱(단차)에 걸려 앞으로 넘어져 중상"
    ],
    cause: [
      "착상 감지 센서(인덕터/플래그) 및 레벨 제어계통 점검 불량, 도어 개방 허용 범위(도어존) 밖에서의 이상 개문"
    ],
    prevention: [
      "유지관리업체: 정기점검 시 착상 레벨 허용치(±10mm) 정밀 측정 및 비정상 착상 시 문 열림 차단 안전회로 점검",
      "관리주체: 단차 발생 및 갇힘 시 즉시 전원 차단 후 전문 기술자 조치 의뢰"
    ],
    tags: ["엘리베이터", "전도", "유지관리과실", "착상단차", "도어존이탈"]
  },
  {
    id: 22,
    page: 35,
    bookPage: 37,
    image: "images/page_35.png",
    title: "운행 중 이동케이블이 승강로 구조물에 걸려 발생한 급정지 전도 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "전도",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "기타 (기계·구조 결함)",
    similarCount: "-",
    summary: "엘리베이터 이동케이블의 장력 편차로 꼬임이 발생해 12층 승강장 문턱에 걸리며 비상 급정지",
    description: [
      "카 하강 운행 중 승강로 내 매달려 있는 이동케이블 및 CCTV 동축케이블이 승강장 출입구 돌출 턱에 걸리면서 당겨져 비상스위치 작동, 카가 급정지하며 탑승자가 바닥에 강하게 전도"
    ],
    cause: [
      "이동케이블 고정 브래킷 및 행거의 유격 과다, 장력 불균형으로 인한 루프 비틀림이 발생하여 승강로 내 구조물 간섭 발생"
    ],
    prevention: [
      "유지관리업체: 이동케이블 행거 및 루프 반경 정기 점검, 추가 케이블(CCTV, 통신선) 가설 시 표준 간격 유지",
      "관리주체: 정기 자체점검 시 승강로 내 돌출부 간섭 유무 철저 검토"
    ],
    tags: ["엘리베이터", "전도", "이동케이블", "구조물간섭", "급정지", "기타원인"]
  },
  {
    id: 23,
    page: 36,
    bookPage: 38,
    image: "images/page_36.png",
    title: "브레이크 고장으로 출입문이 열린 채 상승하여 발생한 개문출발 협착 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "끼임/협착",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "기타 (부품 노후/제어 결함)",
    similarCount: "-",
    summary: "승객 탑승 중 브레이크 전기 제어 이상으로 도어가 열린 채 카가 상승하여 승객 다리가 문틀에 협착",
    description: [
      "6층에서 승객이 엘리베이터에 탑승하려는 순간 카 도어가 닫히지 않은 상태에서 갑자기 카가 상승하여 한쪽 다리가 카 바닥과 승강장 상부 문틀 사이에 끼여 복합 골절"
    ],
    cause: [
      "전자브레이크 제어 릴레이 융착 및 마이크로스위치 접점 오작동으로 개문출발 방지장치(UCMP)가 정상 작동하지 않음"
    ],
    prevention: [
      "관리주체: 권장 교체주기를 초과한 노후 브레이크 부품 적기 교체, 2중계 안전장치 및 UCMP 설치 보강",
      "유지관리업체: 브레이크 라이닝 마모도 및 개문출발 방지 안전회로의 매월 단독 작동 테스트 의무화"
    ],
    tags: ["엘리베이터", "끼임", "개문출발", "UCMP", "브레이크고장", "중대고장"]
  },
  {
    id: 24,
    page: 37,
    bookPage: 39,
    image: "images/page_37.png",
    title: "출입문 미개방 및 제어불능 상태로 급상승하여 발생한 전도 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "전도",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "기타 (전기/전자 제어계 결함)",
    similarCount: "-",
    summary: "장애인용 엘리베이터가 지하 2층 도착 후 문이 안 열린 채 최상층까지 제어 불능 급상승 후 충격 정지",
    description: [
      "승객들이 지하 1층에서 탑승하여 지하 2층에 도착했으나 문이 열리지 않은 상태로 카가 반전 급상승, 최상층 오버트래블 리미트스위치에 부딪혀 급정지하며 승객 전도"
    ],
    cause: [
      "브레이크 전자접촉기(MC) 접점 소착(들러붙음) 및 역기전력 억제 회로 소손으로 제동기가 풀린 채 균형추 무게에 의해 카가 꼭대기로 끌려 올라감"
    ],
    prevention: [
      "유지관리업체: 제어반 내 전자접촉기 접점 마모 및 고착 상태 점검 주기 단축, 역기전력 보호 회로 점검",
      "제조업체: 제동기 2중 제어 및 접점 고착 시 즉시 주전원을 차단하는 감시 회로 설계 적용"
    ],
    tags: ["엘리베이터", "전도", "제어불능상승", "접촉기소착", "역기전력", "기타원인"]
  },
  {
    id: 25,
    page: 38,
    bookPage: 40,
    image: "images/page_38.png",
    title: "에스컬레이터 하부 콤 볼트 풀림으로 인한 파손 급정지 사고",
    elevatorType: "에스컬레이터",
    elevatorCategory: "ES",
    accidentType: "전도",
    casualty: "중상 1건",
    severity: "중상",
    causeType: "기타 (부품 체결 불량)",
    similarCount: "-",
    summary: "하부 콤 고정 볼트가 풀려 헐거워진 상태에서 스텝과 간섭 충돌, 콤 파손과 함께 급정지하여 승객 전도",
    description: [
      "에스컬레이터 하강 운행 중 하부 승강장 콤 플레이트 고정 볼트 체결 불량으로 콤이 들뜨면서 진입하는 스텝과 강하게 충돌·파손, 콤 비상정지장치가 작동하며 탑승자 전도"
    ],
    cause: [
      "콤 고정 볼트 토크 관리 미흡 및 정기 점검 시 콤-스텝 간 맞물림 틈새(1~4mm 규정치) 관리 소홀"
    ],
    prevention: [
      "유지관리업체: 일상·자체점검 시 콤 볼트 풀림 방지 너트 체결 및 마킹 확인, 빗살 간격 게이지 측정 철저",
      "관리주체: 에스컬레이터 이상 진동 및 금속 마찰음 발생 시 즉각 운행 중지"
    ],
    tags: ["에스컬레이터", "전도", "콤볼트풀림", "스텝간섭", "급정지", "부품체결"]
  },
  {
    id: 26,
    page: 39,
    bookPage: 41,
    image: "images/page_39.png",
    title: "닫히는 출입문 사이에 가방 끈이 끼인 채 출발하여 발생한 전도 사고",
    elevatorType: "엘리베이터",
    elevatorCategory: "EL",
    accidentType: "전도",
    casualty: "중상 2건",
    severity: "중상",
    causeType: "기타 (센서 감지 한계/이용자)",
    similarCount: "-",
    summary: "하차 중 닫히는 문에 백팩 끈이 끼었으나 안전장치가 얇은 끈을 감지하지 못하고 출발해 탑승자 전도",
    description: [
      "승객이 하차하는 과정에서 도어 대기시간 종료로 문이 닫히며 어깨에 멘 가방 끈이 도어 사이에 끼임, 안전센서가 얇은 끈을 인식하지 못하고 카가 이동하려 하자 승객이 끌려가며 전도"
    ],
    cause: [
      "출입문 안전접점 스위치가 얇은 물체(5mm 미만 가방끈 등)의 끼임을 감지하지 못해 도어 닫힘 상태로 판정, 개폐기 센서 감지 한계"
    ],
    prevention: [
      "이용자: 승하차 시 닫히는 문에 옷자락이나 가방 끈이 걸리지 않도록 몸 앞쪽으로 가방을 안고 탑승",
      "관리주체: 승강기 승하차 대기시간 충분히 확보(최소 3~5초), 도어 틈새 이물질 감지센서(다점빔) 보강"
    ],
    tags: ["엘리베이터", "전도", "가방끈끼임", "도어센서한계", "승하차주의"]
  }
];

// 통계 데이터 요약 (2023년 기준 & 30년 누적)
const STATS_SUMMARY = {
  year: 2023,
  totalAccidents2023: 42,
  totalCasualties2023: 43,
  fatalities2023: 6,
  severeInjuries2023: 37,
  elevatorFleet: 840049,
  accidentRatePer10k: 0.50,
  cumulativeAccidents: 1751,
  cumulativeFatalities: 290,
  
  // 원인별 분류 (2023년)
  byCause: [
    { name: "이용자 과실", count: 19, percent: 45.2, color: "#ef4444" },
    { name: "기타 (기계·부품 결함 등)", count: 11, percent: 26.2, color: "#64748b" },
    { name: "작업자 과실", count: 5, percent: 11.9, color: "#f97316" },
    { name: "유지관리업체 과실", count: 4, percent: 9.5, color: "#eab308" },
    { name: "관리주체 과실", count: 3, percent: 7.1, color: "#8b5cf6" },
    { name: "제조업체 과실", count: 0, percent: 0.0, color: "#06b6d4" }
  ],
  
  // 승강기 종류별 (2023년)
  byElevatorType: [
    { name: "승객용 엘리베이터", count: 13, percent: 31.0, icon: "lift" },
    { name: "에스컬레이터", count: 12, percent: 28.6, icon: "escalator" },
    { name: "장애인용 엘리베이터", count: 8, percent: 19.0, icon: "accessible" },
    { name: "소방구조용 엘리베이터", count: 4, percent: 9.5, icon: "fire" },
    { name: "수평보행기 (무빙워크)", count: 2, percent: 4.8, icon: "walk" },
    { name: "화물/기타 엘리베이터", count: 3, percent: 7.1, icon: "cargo" }
  ],

  // 사고 유형별 (2023년)
  byAccidentType: [
    { name: "전도 (넘어짐)", count: 18, percent: 42.9, icon: "fall" },
    { name: "끼임 / 협착", count: 10, percent: 23.8, icon: "pinch" },
    { name: "추락", count: 8, percent: 19.0, icon: "drop" },
    { name: "충돌", count: 6, percent: 14.3, icon: "crash" }
  ],

  // 연령대별 (2023년 피해자 43명)
  byAgeGroup: [
    { name: "15세 이상 ~ 64세", count: 24, percent: 55.8 },
    { name: "65세 이상 고령자", count: 16, percent: 37.2 },
    { name: "14세 이하 어린이", count: 3, percent: 7.0 }
  ],

  // 피해자 구분별
  byVictimRole: [
    { name: "승강기 일반 이용자", count: 37, percent: 86.0 },
    { name: "승강기 설치/보수 기술자", count: 5, percent: 11.6 },
    { name: "건물 관리자 (경비원 등)", count: 1, percent: 2.4 }
  ],

  // 장소별 (건물 용도별)
  byBuildingType: [
    { name: "운수시설 (지하철·역사·공항)", count: 10, percent: 23.8 },
    { name: "공동주택 (아파트 등)", count: 8, percent: 19.0 },
    { name: "근린생활시설", count: 8, percent: 19.0 },
    { name: "판매시설 (백화점·마트)", count: 5, percent: 11.9 },
    { name: "공장 및 산업시설", count: 3, percent: 7.1 },
    { name: "숙박·업무·기타", count: 8, percent: 19.0 }
  ]
};

// 제5장 예방 안내 포스터 갤러리 데이터
const POSTERS_DATA = [
  { id: 1, page: 44, bookPage: 46, image: "images/page_44.png", title: "다중밀집시설 에스컬레이터 안전관리 요령", category: "다중밀집/압사예방" },
  { id: 2, page: 45, bookPage: 47, image: "images/page_45.png", title: "에스컬레이터 중대사고(역주행 등) 발생 알림", category: "긴급알림" },
  { id: 3, page: 46, bookPage: 48, image: "images/page_46.png", title: "손끼임·추락사고 예방 안내문", category: "이용자안전" },
  { id: 4, page: 47, bookPage: 49, image: "images/page_47.png", title: "승강기 철거 작업 중 작업자 사망사고 예방대책", category: "작업자안전" },
  { id: 5, page: 48, bookPage: 50, image: "images/page_48.png", title: "PLC 적용 엘리베이터 개문출발 안전사고 예방대책", category: "기술/부품안전" },
  { id: 6, page: 49, bookPage: 51, image: "images/page_49.png", title: "승강기 개구부 추락방지 예방 안내문", category: "현장관리" },
  { id: 7, page: 50, bookPage: 52, image: "images/page_50.png", title: "비·눈 내리는 날 에스컬레이터·무빙워크 미끄럼 주의보", category: "기상특보안전" },
  { id: 8, page: 51, bookPage: 53, image: "images/page_51.png", title: "승강기 중대한 고장 예방 안내", category: "유지보수" },
  { id: 9, page: 52, bookPage: 54, image: "images/page_52.png", title: "승강기 안전사고 예방 및 자체점검 요령", category: "자체점검" },
  { id: 10, page: 53, bookPage: 55, image: "images/page_53.png", title: "VAC 모델 검사업무 시 제어반 변압기 점검 철저 안내", category: "전문검사" },
  { id: 11, page: 54, bookPage: 56, image: "images/page_54.png", title: "출입문 안전회로 단락 위험 경고 안내문", category: "회로안전" },
  { id: 12, page: 55, bookPage: 57, image: "images/page_55.png", title: "승강기 설치·교체 작업자 안전사고 예방수칙 포스터", category: "작업자안전" }
];

// 제6장 침수 상황 대응 요령 매뉴얼 데이터
const FLOOD_GUIDELINES = [
  {
    step: "01. 침수 대비",
    title: "일상점검 및 사전 예방조치",
    page: 58,
    bookPage: 60,
    image: "images/page_58.png",
    points: [
      "기상청 호우경보 및 태풍 예보 시 배수펌프 및 승강로 피트 집수정 작동 상태 점검",
      "외부 빗물이 기계실 및 승강장 문턱으로 유입되지 않도록 차수판 및 모래주머니 비치",
      "승강로 누수 여부 수시 점검 및 배수로 이물질 제거"
    ]
  },
  {
    step: "02. 침수 예상 시",
    title: "선제적 엘리베이터 대피 운행",
    page: 59,
    bookPage: 61,
    image: "images/page_59.png",
    points: [
      "침수 위험 감지 시 즉시 카 내부 승객의 잔류 여부를 확인하고 전원 하차 유도",
      "카를 최상층(또는 침수 영향이 없는 고층부)으로 이동시켜 주차",
      "주전원 스위치를 차단(OFF)하고 운행 중지 안내 표지판 부착"
    ]
  },
  {
    step: "03. 침수 발생 시",
    title: "긴급 비상조치 및 감전 예방",
    page: 60,
    bookPage: 62,
    image: "images/page_60.png",
    points: [
      "피트에 물이 차기 시작하면 즉시 기계실 주전원을 차단하여 감전 및 누전 화재 예방",
      "절대 침수된 승강기에 탑승하거나 운행을 재개하지 말 것",
      "피트 배수펌프를 가동하여 배수 작업을 실시하고 승강장 주변 접근 통제"
    ]
  },
  {
    step: "04. 침수 피해 후",
    title: "사후관리 및 정밀 안전진단",
    page: 62,
    bookPage: 64,
    image: "images/page_62.png",
    points: [
      "배수 완료 후 자연 건조 및 열풍 건조 실시 (임의 통전 절대 금지)",
      "유지관리업체 및 한국승강기안전공단의 정밀안전진단 및 절연저항 측정 완료 후 운행 재개",
      "침수된 주요 부품(완충기, 리미트스위치, 조속기 텐션풀리, 전선류) 교체 조치"
    ]
  }
];

if (typeof module !== 'undefined') {
  module.exports = { CASES_DATA, STATS_SUMMARY, POSTERS_DATA, FLOOD_GUIDELINES };
}
