export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  role: number; // 0=Customer, 1=Admin
}

export interface AuthResponse {
  accessToken: string;
  userId: string;
  email: string;
  displayName: string;
  role: string;
}

export interface JwtPayload {
  sub: string;           // userId
  email: string;
  unique_name: string;   // displayName
  role: string;          // "Customer" | "Admin"
  exp: number;
  iss: string;
  aud: string;
}
