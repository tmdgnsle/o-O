export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  googleId?: string;
}

export interface LoginResponse {
  message: string;
  userId: number;
}
