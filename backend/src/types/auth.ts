export interface JwtPayload {
  sub: string
  email: string
  role: string
  companyId?: string | null
  iat?: number
  exp?: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  name: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
    companyId?: string | null
  }
}

export interface CurrentUserResponse {
  id: string
  email: string
  name: string
  role: string
  companyId?: string | null
  createdAt: Date
  updatedAt: Date
}
