import { apiSlice } from '@/services/baseApi';
import type { Paginated } from '@/types/api';
import type { StudentProfile, CreateStudentRequest } from './types';

export const studentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<Paginated<StudentProfile>, { page?: number } | void>({
      query: (args) => ({ url: '/students/', params: args ?? undefined }),
      providesTags: ['Students'],
    }),
    createStudent: builder.mutation<StudentProfile, CreateStudentRequest>({
      query: (body) => ({ url: '/students/', method: 'POST', body }),
      invalidatesTags: ['Students'],
    }),
  }),
});

export const { useGetStudentsQuery, useCreateStudentMutation } = studentApi;
