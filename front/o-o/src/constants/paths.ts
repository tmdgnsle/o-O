// 라우트 경로 상수 정의
export const PATHS = {
  HOME: '/',
  TREND: '/trend',
  MINDMAP: '/mindmap',
  MYPAGE: '/mypage',
} as const;

// 경로 타입 정의
export type PathType = typeof PATHS[keyof typeof PATHS];

