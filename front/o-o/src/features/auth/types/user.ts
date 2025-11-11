export interface User {
  nickname: string;
  email: string;
  profileImage?: string;
  googleId?: string;
}

export interface LoginResponse {
  message: string;
  userId: number;
}
