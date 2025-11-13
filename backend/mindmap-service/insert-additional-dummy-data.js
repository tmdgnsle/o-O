// MongoDB 추가 더미데이터 삽입 스크립트
// 워크스페이스 1번에 마인드맵 노드 30개 추가
// 사용법: mongosh "mongodb://k13d202.p.ssafy.io:27017/mindmap" insert-additional-dummy-data.js

// 현재 시간
const now = new Date();

// 추가 더미 노드 데이터 30개 (x, y는 null)
// 1번: 루트 (parentId: null)
// 2~5번: parentId는 1
// 6번 이후: 랜덤 parentId (1~이전 노드 중 랜덤)
const additionalDummyNodes = [
  // 1번: 루트 노드 (parentId: null)
  {
    workspaceId: NumberLong(1),
    parentId: null,
    type: "root",
    keyword: "프로젝트 마인드맵",
    memo: "전체 프로젝트의 루트 노드입니다",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#3b82f6",
    createdAt: now,
    updatedAt: now
  },

  // 2~5번: parentId는 1
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(1),
    type: "text",
    keyword: "백엔드 개발",
    memo: "Spring Boot, MongoDB를 사용한 백엔드 시스템",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#10b981",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(1),
    type: "text",
    keyword: "프론트엔드 개발",
    memo: "React, TypeScript를 사용한 프론트엔드",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#8b5cf6",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(1),
    type: "text",
    keyword: "데이터베이스 설계",
    memo: "MongoDB 스키마 설계 및 최적화",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#06b6d4",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(1),
    type: "text",
    keyword: "배포 전략",
    memo: "Docker 및 CI/CD 파이프라인",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#fbbf24",
    createdAt: now,
    updatedAt: now
  },

  // 6번 이후: 랜덤 parentId
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(2), // 랜덤
    type: "text",
    keyword: "Spring Security",
    memo: "보안 프레임워크 설정 및 구현",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#22c55e",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(3), // 랜덤
    type: "text",
    keyword: "컴포넌트 설계",
    memo: "재사용 가능한 React 컴포넌트",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#ec4899",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(4), // 랜덤
    type: "text",
    keyword: "인덱싱 전략",
    memo: "복합 인덱스 및 성능 최적화",
    analysisStatus: "PENDING",
    x: null,
    y: null,
    color: "#a855f7",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(5), // 랜덤
    type: "text",
    keyword: "Docker Compose",
    memo: "멀티 컨테이너 구성",
    analysisStatus: "DONE",
    x: null,
    y: null,
    color: "#fbbf24",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(1), // 랜덤
    type: "text",
    keyword: "테스트 전략",
    memo: "단위/통합/E2E 테스트",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#4ade80",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(6), // 랜덤
    type: "text",
    keyword: "JPA/Hibernate",
    memo: "ORM 매핑 및 쿼리 최적화",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#84cc16",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(7), // 랜덤
    type: "text",
    keyword: "상태 관리",
    memo: "Zustand를 이용한 전역 상태 관리",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#14b8a6",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(2), // 랜덤
    type: "text",
    keyword: "API 설계",
    memo: "RESTful API 설계 및 문서화",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#f59e0b",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(8), // 랜덤
    type: "text",
    keyword: "복제 전략",
    memo: "MongoDB Replica Set 구성",
    analysisStatus: "PENDING",
    x: null,
    y: null,
    color: "#10b981",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(3), // 랜덤
    type: "text",
    keyword: "라우팅",
    memo: "React Router 설정",
    analysisStatus: "DONE",
    x: null,
    y: null,
    color: "#8b5cf6",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(11), // 랜덤
    type: "text",
    keyword: "Exception 처리",
    memo: "글로벌 예외 처리 전략",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#f97316",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(5), // 랜덤
    type: "text",
    keyword: "GitHub Actions",
    memo: "자동화된 배포 파이프라인",
    analysisStatus: "DONE",
    x: null,
    y: null,
    color: "#f59e0b",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(13), // 랜덤
    type: "text",
    keyword: "Swagger 문서화",
    memo: "API 명세 자동 생성",
    analysisStatus: "DONE",
    x: null,
    y: null,
    color: "#06b6d4",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(7), // 랜덤
    type: "text",
    keyword: "Custom Hooks",
    memo: "재사용 가능한 로직 분리",
    analysisStatus: "DONE",
    x: null,
    y: null,
    color: "#f472b6",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(10), // 랜덤
    type: "text",
    keyword: "성능 최적화",
    memo: "로딩 시간 개선",
    analysisStatus: "PENDING",
    x: null,
    y: null,
    color: "#22c55e",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(4), // 랜덤
    type: "text",
    keyword: "백업 정책",
    memo: "주기적 백업 및 복구 계획",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#14b8a6",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(12), // 랜덤
    type: "text",
    keyword: "Store 구조",
    memo: "상태 저장소 설계",
    analysisStatus: "DONE",
    x: null,
    y: null,
    color: "#14b8a6",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(9), // 랜덤
    type: "text",
    keyword: "환경 변수 관리",
    memo: "개발/스테이징/프로덕션 분리",
    analysisStatus: "DONE",
    x: null,
    y: null,
    color: "#d97706",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(6), // 랜덤
    type: "text",
    keyword: "인증/인가",
    memo: "JWT 기반 인증 시스템",
    analysisStatus: "DONE",
    x: null,
    y: null,
    color: "#ef4444",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(15), // 랜덤
    type: "text",
    keyword: "스타일링",
    memo: "Tailwind CSS 활용",
    analysisStatus: "DONE",
    x: null,
    y: null,
    color: "#a855f7",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(1), // 랜덤
    type: "text",
    keyword: "보안 강화",
    memo: "XSS, CSRF 방어",
    analysisStatus: "PROCESSING",
    x: null,
    y: null,
    color: "#dc2626",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(18), // 랜덤
    type: "text",
    keyword: "버전 관리",
    memo: "API 버전 관리 전략",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#0ea5e9",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(14), // 랜덤
    type: "text",
    keyword: "쿼리 최적화",
    memo: "Aggregation Pipeline 최적화",
    analysisStatus: "PROCESSING",
    x: null,
    y: null,
    color: "#06b6d4",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(3), // 랜덤
    type: "text",
    keyword: "폼 처리",
    memo: "React Hook Form 사용",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#c026d3",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(17), // 랜덤
    type: "text",
    keyword: "모니터링",
    memo: "서버 상태 모니터링 시스템",
    analysisStatus: "PENDING",
    x: null,
    y: null,
    color: "#ea580c",
    createdAt: now,
    updatedAt: now
  },
  {
    workspaceId: NumberLong(1),
    parentId: NumberLong(22), // 랜덤
    type: "text",
    keyword: "Persist",
    memo: "로컬 스토리지 연동",
    analysisStatus: "NONE",
    x: null,
    y: null,
    color: "#06b6d4",
    createdAt: now,
    updatedAt: now
  }
];

print("=== 워크스페이스 1번에 추가 더미 노드 30개 삽입 시작 ===\n");

let successCount = 0;

// NodeSequence를 이용하여 nodeId 자동 생성하면서 노드 삽입
additionalDummyNodes.forEach((node, index) => {
  // 1. sequence 증가 및 가져오기 (atomic 연산)
  const sequenceDoc = db.sequences.findAndModify({
    query: { workspaceId: NumberLong(1) },
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

  print(`[${index + 1}/30] 노드 생성 - nodeId: ${nextNodeId}, keyword: "${node.keyword}"`);
});

print("\n=== 삽입 완료 ===");
print(`총 ${successCount}개의 노드가 추가로 생성되었습니다.\n`);

// 결과 확인
const nodeCount = db.nodes.countDocuments({ workspaceId: NumberLong(1) });
const currentSequence = db.sequences.findOne({ workspaceId: NumberLong(1) });

print("=== 결과 확인 ===");
print(`워크스페이스 1번의 전체 노드 개수: ${nodeCount}`);
print(`현재 시퀀스 값: ${currentSequence.sequence}`);
