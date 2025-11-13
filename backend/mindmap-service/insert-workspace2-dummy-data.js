// MongoDB 더미데이터 삽입 스크립트 - Workspace 2
// 워크스페이스 2번에 마인드맵 노드 20개 추가
// 사용법: mongosh "mongodb://k13d202.p.ssafy.io:27017/mindmap" insert-workspace2-dummy-data.js

// 현재 시간
const now = new Date();

// 워크스페이스 2번 더미 노드 데이터 20개 (x, y는 랜덤 좌표)
// 1번: 루트 (parentId: null, type: text)
// 2~5번: parentId는 1
// 6번 이후: 랜덤 parentId
const workspace2DummyNodes = [
  // 1번: 루트 노드 (parentId: null, type: text)
  {
    workspaceId: NumberLong(2),
    parentId: null,
    type: "text",
    keyword: "AI 마인드맵 프로젝트",
    memo: "인공지능 기반 마인드맵 서비스",
    analysisStatus: "NONE",
    x: 0.0,
    y: 0.0,
    color: "#6366f1",
    createdAt: now,
    updatedAt: now
  },

  // 2~5번: parentId는 1
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(1),
    type: "text",
    keyword: "AI 모델",
    memo: "GPT 기반 분석 엔진",
    analysisStatus: "NONE",
    x: -250.0,
    y: 120.0,
    color: "#8b5cf6",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(1),
    type: "text",
    keyword: "실시간 협업",
    memo: "WebSocket 기반 실시간 동기화",
    analysisStatus: "NONE",
    x: 250.0,
    y: 120.0,
    color: "#06b6d4",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(1),
    type: "text",
    keyword: "데이터 분석",
    memo: "사용자 행동 패턴 분석",
    analysisStatus: "NONE",
    x: -100.0,
    y: 180.0,
    color: "#10b981",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(1),
    type: "text",
    keyword: "UI/UX 개선",
    memo: "사용자 경험 최적화",
    analysisStatus: "NONE",
    x: 100.0,
    y: 180.0,
    color: "#f59e0b",
    createdAt: now,
    updatedAt: now
  },

  // 6번 이후: 랜덤 parentId
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(2),
    type: "text",
    keyword: "프롬프트 엔지니어링",
    memo: "효과적인 프롬프트 설계",
    analysisStatus: "DONE",
    x: -350.0,
    y: 240.0,
    color: "#a855f7",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(3),
    type: "text",
    keyword: "커서 동기화",
    memo: "다중 사용자 커서 표시",
    analysisStatus: "PENDING",
    x: 350.0,
    y: 240.0,
    color: "#14b8a6",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(4),
    type: "text",
    keyword: "로그 수집",
    memo: "Kafka 기반 이벤트 로깅",
    analysisStatus: "NONE",
    x: -180.0,
    y: 300.0,
    color: "#22c55e",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(5),
    type: "text",
    keyword: "반응형 디자인",
    memo: "모바일 최적화",
    analysisStatus: "DONE",
    x: 180.0,
    y: 300.0,
    color: "#fb923c",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(2),
    type: "text",
    keyword: "모델 파인튜닝",
    memo: "도메인 특화 학습",
    analysisStatus: "PROCESSING",
    x: -420.0,
    y: 180.0,
    color: "#c084fc",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(6),
    type: "text",
    keyword: "컨텍스트 윈도우",
    memo: "토큰 제한 관리",
    analysisStatus: "NONE",
    x: -450.0,
    y: 320.0,
    color: "#d946ef",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(7),
    type: "text",
    keyword: "충돌 해결",
    memo: "CRDT 알고리즘 적용",
    analysisStatus: "DONE",
    x: 450.0,
    y: 320.0,
    color: "#06b6d4",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(3),
    type: "text",
    keyword: "권한 관리",
    memo: "역할 기반 접근 제어",
    analysisStatus: "DONE",
    x: 320.0,
    y: 180.0,
    color: "#ef4444",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(8),
    type: "text",
    keyword: "시각화",
    memo: "차트 및 그래프 생성",
    analysisStatus: "PENDING",
    x: -280.0,
    y: 380.0,
    color: "#84cc16",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(5),
    type: "text",
    keyword: "다크모드",
    memo: "테마 전환 기능",
    analysisStatus: "DONE",
    x: 80.0,
    y: 360.0,
    color: "#64748b",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(10),
    type: "text",
    keyword: "임베딩",
    memo: "벡터 유사도 검색",
    analysisStatus: "NONE",
    x: -500.0,
    y: 240.0,
    color: "#7c3aed",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(12),
    type: "text",
    keyword: "버전 관리",
    memo: "변경 이력 추적",
    analysisStatus: "PENDING",
    x: 520.0,
    y: 400.0,
    color: "#0ea5e9",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(4),
    type: "text",
    keyword: "대시보드",
    memo: "실시간 통계 표시",
    analysisStatus: "DONE",
    x: -80.0,
    y: 360.0,
    color: "#059669",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(9),
    type: "text",
    keyword: "터치 제스처",
    memo: "멀티터치 지원",
    analysisStatus: "NONE",
    x: 280.0,
    y: 380.0,
    color: "#f97316",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(2),
    parentId: NumberLong(13),
    type: "text",
    keyword: "알림 시스템",
    memo: "실시간 푸시 알림",
    analysisStatus: "PENDING",
    x: 420.0,
    y: 260.0,
    color: "#ec4899",
    createdAt: now,
    updatedAt: now
  }
];

print("=== 워크스페이스 2번에 더미 노드 20개 삽입 시작 ===\n");

let successCount = 0;

// NodeSequence를 이용하여 nodeId 자동 생성하면서 노드 삽입
workspace2DummyNodes.forEach((node, index) => {
  // 1. sequence 증가 및 가져오기 (atomic 연산)
  const sequenceDoc = db.sequences.findAndModify({
    query: { workspaceId: NumberLong(2) },
    update: { $inc: { sequence: NumberLong(1) } },
    new: true,
    upsert: true
  });

  const nextNodeId = sequenceDoc.sequence;

  // 2. nodeId 할당
  node.nodeId = nextNodeId;

  // 3. 노드 삽입
  db.nodes.insertOne(node);
  successCount++;

  print(`[${index + 1}/20] 노드 생성 - nodeId: ${nextNodeId}, keyword: "${node.keyword}"`);
});

print("\n=== 삽입 완료 ===");
print(`총 ${successCount}개의 노드가 생성되었습니다.\n`);

// 결과 확인
const nodeCount = db.nodes.countDocuments({ workspaceId: NumberLong(2) });
const currentSequence = db.sequences.findOne({ workspaceId: NumberLong(2) });

print("=== 결과 확인 ===");
print(`워크스페이스 2번의 전체 노드 개수: ${nodeCount}`);
print(`현재 시퀀스 값: ${currentSequence.sequence}`);
