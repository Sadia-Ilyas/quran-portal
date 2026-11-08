import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from './types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
}

const initialState: AuthState = { user: null, accessToken: null, status: 'idle' };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    bootstrapStarted: (s) => { s.status = 'loading'; },
    setCredentials: (s, a: PayloadAction<{ user: AuthUser; accessToken: string }>) => {
      s.user = a.payload.user;
      s.accessToken = a.payload.accessToken;
      s.status = 'authenticated';
    },
    tokenRefreshed: (s, a: PayloadAction<string>) => { s.accessToken = a.payload; },
    setUser: (s, a: PayloadAction<AuthUser>) => { s.user = a.payload; },
    loggedOut: (s) => {
      s.user = null;
      s.accessToken = null;
      s.status = 'unauthenticated';
    },
  },
});

export const { bootstrapStarted, setCredentials, tokenRefreshed, setUser, loggedOut } = authSlice.actions;
export default authSlice.reducer;