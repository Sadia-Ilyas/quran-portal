export type Gender = 'MALE' | 'FEMALE';
export type StudentLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface CreateStudentRequest {
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  guardian_name?: string;
  guardian_relationship?: string;
  guardian_phone?: string;
  age?: number;
  gender?: Gender;
  country?: string;
  timezone?: string;
  current_level?: StudentLevel;
}

export interface StudentProfile extends CreateStudentRequest {
  id: string;
  full_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
