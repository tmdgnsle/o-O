export interface User {
  nickname: string;
  email: string;
  profileImage?: string;
}

export interface LoginResponse {
  message: string;
  userId: number;
}
