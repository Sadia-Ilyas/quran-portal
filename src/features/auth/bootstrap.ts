import type { AppDispatch } from '@/App/store';
import { authApi } from './authApi';
import { bootstrapStarted, setCredentials, tokenRefreshed, loggedOut } from './authSlice';
import { toAuthUser } from './types';

let inFlight: Promise<void> | null = null;

export function bootstrapSession(dispatch: AppDispatch) {
  if (inFlight) return inFlight;
  dispatch(bootstrapStarted());
  inFlight = (async () => {
    try {
      const { access } = await dispatch(authApi.endpoints.refresh.initiate()).unwrap();
      dispatch(tokenRefreshed(access)); // token only, status stays "loading"
      const me = await dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })).unwrap();
      dispatch(setCredentials({ user: toAuthUser(me), accessToken: access }));
    } catch {
      dispatch(loggedOut());
    }
  })();
  return inFlight;
}