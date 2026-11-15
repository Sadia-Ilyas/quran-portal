export type Gender = "MALE" | "FEMALE";

/** Shape returned by GET /teachers/ results[] */
export interface TeacherProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  bio: string;
  qualification: string;
  specialisation: string;
  experience_years: number;
  /** GET returns a string (comma-joined by backend) */
  languages: string;
  gender: Gender;
  /** Decimal string from backend, e.g. "25.00" */
  hourly_rate: string;
  timezone: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

/** Body sent to POST /teachers/ */
export interface CreateTeacherRequest {
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  bio?: string;
  qualification?: string;
  specialisation?: string;
  experience_years?: number;
  /** POST sends an array */
  languages?: string[];
  gender?: Gender;
  /** Must be non-negative decimal string */
  hourly_rate?: string;
  timezone?: string;
  is_verified?: boolean;
}
