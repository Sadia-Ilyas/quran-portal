export interface Paginated<T> { count: number; next: string | null; previous: string | null; results: T[] }

export interface TeacherProfile {            // ASSUMPTION
  id: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  experience_years?: number;
  bio?: string;
  languages?: string[];
}
export type CreateTeacherRequest = Omit<TeacherProfile, 'id'>;