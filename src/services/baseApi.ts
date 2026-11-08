import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/App/store';
import { loggedOut, tokenRefreshed } from '@/features/auth/authSlice';



const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  
  credentials: 'include', // sends the HttpOnly refresh cookie
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken; // in memory, not localStorage
   
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

// One refresh at a time: the backend rotates and blacklists refresh tokens,
// so parallel refresh calls would invalidate each other.
let refreshPromise: Promise<string | null> | null = null;

const SKIP_REFRESH = ['/users/login/', '/users/token/refresh/', '/users/logout/'];

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra,
) => {
  let result = await rawBaseQuery(args, api, extra);

  const url = typeof args === 'string' ? args : args.url;
  if (result.error?.status === 401 && !SKIP_REFRESH.some((p) => url.includes(p))) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const r = await rawBaseQuery({ url: '/users/token/refresh/', method: 'POST' }, api, extra);
        if (r.data) {
          const access = (r.data as { access: string }).access; // ASSUMPTION: { access }
          api.dispatch(tokenRefreshed(access));
          return access;
        }
        api.dispatch(loggedOut());
        return null;
      })().finally(() => {
        refreshPromise = null;
      });
    }
    const token = await refreshPromise;
    if (token) result = await rawBaseQuery(args, api, extra); // retry once
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Teachers', 'Students'],
  endpoints: () => ({}),
});