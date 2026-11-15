export type Role = 'admin' | 'teacher' | 'student';

// Shape returned by the Django API
export interface ApiUser {
  id: string;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  role: string;
  require_password_reset?: boolean;
  require_verification?: boolean;
}

// Shape used inside the frontend
export interface AuthUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  requirePasswordReset?: boolean;
  country?: string;
  timezone?: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  user: ApiUser;
  tokens: { access: string };
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
  phone_number: string;
}

export const toAuthUser = (u: ApiUser): AuthUser => ({
  id: u.id,
  name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
  firstName: u.first_name ?? "",
  lastName: u.last_name ?? "",
  email: u.email,
  phone: u.phone_number ?? undefined,
  role: (u.role?.toLowerCase() as Role) || 'student',
  requirePasswordReset: !!u.require_password_reset,
});
