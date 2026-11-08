export type Gender = 'MALE' | 'FEMALE';                       // check Swagger for other values
export type StudentLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'; // ASSUMPTION: check the enum in Swagger

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
}