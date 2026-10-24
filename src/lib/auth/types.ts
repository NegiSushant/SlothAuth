export type UserRole =
  | "CHIEF_MEDICAL_OFFICER"
  | "ATTENDING_PHYSICIAN"
  | "PRIOR_AUTH_DIRECTOR"
  | "CLINICAL_SPECIALIST"
  | "HEALTH_ADMIN";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole | string;
  organization: string;
  createdAt?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  role?: string;
  organization?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  message?: string;
}
