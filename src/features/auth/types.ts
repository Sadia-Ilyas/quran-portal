export type Role = 'admin' | 'teacher' | 'student';

// Shape returned by the Django API  (ASSUMPTION: confirm with schema.yaml)
export interface ApiUser {
  id: string;
  email: string;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  role: string; // probably "ADMIN" | "TEACHER" | "STUDENT"
  require_password_reset: boolean;
  require_verification: boolean;
}

// Shape used inside the frontend
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  requirePasswordReset: boolean;
  country?: string;
  timezone?: string;
  avatarUrl?: string;
}

export interface LoginRequest { identifier: string; password: string }
export interface LoginResponse { user: ApiUser; tokens: { access: string } } // ASSUMPTION
export interface ChangePasswordRequest { old_password: string; new_password: string } // ASSUMPTION

export const toAuthUser = (u: ApiUser): AuthUser => ({
  id: u.id,
  name: `${u.first_name} ${u.last_name}`.trim(),
  email: u.email,
  phone: u.phone_number ?? undefined,
  role: u.role.toLowerCase() as Role,
  requirePasswordReset: u.require_password_reset,
});
