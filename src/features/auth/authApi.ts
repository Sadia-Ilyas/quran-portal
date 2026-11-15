import { apiSlice } from '@/services/baseApi';
import { setCredentials, loggedOut, setUser } from './authSlice';
import {
  toAuthUser,
  type ApiUser,
  type LoginRequest,
  type LoginResponse,
  type ChangePasswordRequest,
  type UpdateProfileRequest,
} from './types';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/users/login/', method: 'POST', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ user: toAuthUser(data.user), accessToken: data.tokens.access }));
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/users/logout/', method: 'POST' }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(loggedOut());
          dispatch(apiSlice.util.resetApiState()); // clear cached data of the previous user
        }
      },
    }),
    refresh: builder.mutation<{ access: string }, void>({
      query: () => ({ url: '/users/token/refresh/', method: 'POST' }),
    }),
    getMe: builder.query<ApiUser, void>({
      query: () => '/users/me/',
      providesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(toAuthUser(data)));
        } catch {
          // handled by caller / bootstrap
        }
      },
    }),
    updateMe: builder.mutation<ApiUser, UpdateProfileRequest>({
      query: (body) => ({ url: '/users/me/', method: 'PUT', body }),
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(toAuthUser(data)));
        } catch {
          // error handled by caller
        }
      },
    }),
    changePassword: builder.mutation<{ detail?: string }, ChangePasswordRequest>({
      query: (body) => ({ url: '/users/change-password/', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
} = authApi;
