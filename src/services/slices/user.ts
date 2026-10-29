import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  isLoading: boolean;
  loginError: string | undefined;
  registerError: string | undefined;
  updateError: string | undefined;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  loginError: undefined,
  registerError: undefined,
  updateError: undefined,
};

const saveTokens = (accessToken: string, refreshToken: string): void => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = (): void => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async (data: TRegisterData) => {
    const response = await registerUserApi(data);
    saveTokens(response.accessToken, response.refreshToken);
    return response.user;
  }
);

export const loginUser = createAsyncThunk('user/loginUser', async (data: TLoginData) => {
  const response = await loginUserApi(data);
  saveTokens(response.accessToken, response.refreshToken);
  return response.user;
});

// проверяем, авторизован ли пользователь, при загрузке приложения
export const checkUserAuth = createAsyncThunk('user/checkUserAuth', async () => {
  if (!getCookie('accessToken')) {
    return null;
  }

  try {
    const response = await getUserApi();
    return response.user;
  } catch (err) {
    clearTokens();
    throw err;
  }
});

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: Partial<TRegisterData>) => {
    const response = await updateUserApi(data);
    return response.user;
  }
);

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  await logoutApi();
  clearTokens();
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  selectors: {
    selectUser: (state) => state.user,
    selectIsAuthChecked: (state) => state.isAuthChecked,
    selectLoginError: (state) => state.loginError,
    selectRegisterError: (state) => state.registerError,
    selectUpdateUserError: (state) => state.updateError,
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.registerError = undefined;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.registerError = action.error.message;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.loginError = undefined;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.loginError = action.error.message;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.updateError = undefined;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.updateError = action.error.message;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const {
  selectUser,
  selectIsAuthChecked,
  selectLoginError,
  selectRegisterError,
  selectUpdateUserError,
} = userSlice.selectors;
