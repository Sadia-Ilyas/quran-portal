import { apiSlice } from '@/services/baseApi';
import { setCredentials, loggedOut, setUser } from './authSlice';
import { toAuthUser, type ApiUser, type LoginRequest, type LoginResponse, type ChangePasswordRequest } from './types';

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
        try { await queryFulfilled; } finally {
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
        const { data } = await queryFulfilled;
        dispatch(setUser(toAuthUser(data)));
      },
    }),
    changePassword: builder.mutation<{ detail?: string }, ChangePasswordRequest>({
      query: (body) => ({ url: '/users/change-password/', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation, useLogoutMutation, useGetMeQuery, useChangePasswordMutation,
} = authApi;