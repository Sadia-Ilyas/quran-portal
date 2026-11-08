import { apiSlice } from '@/services/baseApi';
import type { Paginated, TeacherProfile, CreateTeacherRequest } from './types';

export const teacherApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTeachers: builder.query<Paginated<TeacherProfile>, { page?: number } | void>({
      query: (args) => ({ url: '/teachers/', params: args ?? undefined }),
      providesTags: ['Teachers'],
    }),
    createTeacher: builder.mutation<TeacherProfile, CreateTeacherRequest>({
      query: (body) => ({ url: '/teachers/', method: 'POST', body }),
      invalidatesTags: ['Teachers'],
    }),
  }),
});

export const { useGetTeachersQuery, useCreateTeacherMutation } = teacherApi;