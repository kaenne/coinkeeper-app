import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authService from '../services/authService';
import type { User } from './auth/auth.types';

// Типы для credentials
interface LoginCredentials {
  email: string;
  password: string;
}
interface RegisterData extends LoginCredentials {
  // name?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialToken = localStorage.getItem('authToken');

const initialState: AuthState = {
  user: null,
  token: initialToken,
  isLoading: !!initialToken, // Если токен есть, isLoading: true, т.к. checkAuthStatus будет запущен
  error: null,
  isAuthenticated: false, // Изначально false, пока checkAuthStatus не подтвердит
};

// Async Thunks
export const loginUser = createAsyncThunk<
  { user: User; token: string },
  LoginCredentials,
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const data = await authService.login(credentials);
    localStorage.setItem('authToken', data.token);
    return data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to login';
    return rejectWithValue(message);
  }
});

export const registerUser = createAsyncThunk<
  { user: User; token: string },
  RegisterData,
  { rejectValue: string }
>('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const data = await authService.register(userData);
    localStorage.setItem('authToken', data.token);
    return data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to register';
    return rejectWithValue(message);
  }
});

export const checkAuthStatus = createAsyncThunk<
  { user: User; token: string },
  void,
  { rejectValue: string }
>('auth/checkAuthStatus', async (_, { rejectWithValue }) => {
  const tokenFromStorage = localStorage.getItem('authToken');
  console.log('[checkAuthStatus] tokenFromStorage:', tokenFromStorage);

  if (!tokenFromStorage) {
    console.log('[checkAuthStatus] No token found, rejecting.');
    return rejectWithValue('No token found'); 
  }
  try {
    console.log('[checkAuthStatus] Token found, fetching user...');
    const user = await authService.fetchMe(tokenFromStorage);
    console.log('[checkAuthStatus] User fetched:', user);
    return { user, token: tokenFromStorage };
  } catch (error: any) {
    localStorage.removeItem('authToken');
    const message = error.response?.data?.message || error.message || 'Session invalid';
    console.error('[checkAuthStatus] Error:', message);
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      localStorage.removeItem('authToken');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to login';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to register';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        console.log('[authSlice] checkAuthStatus.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
        console.log('[authSlice] checkAuthStatus.fulfilled, payload:', action.payload);
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action: PayloadAction<string | undefined>) => {
        console.log('[authSlice] checkAuthStatus.rejected, payload:', action.payload);
        state.isLoading = false;
        // Если причина "No token found", не считаем это ошибкой для отображения
        if (action.payload === 'No token found') {
          state.error = null;
        } else {
          state.error = action.payload ?? 'Session invalid';
        }
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout } = authSlice.actions;

// Селекторы
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
