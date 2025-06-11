// src/store/auth/auth.reducer.ts
import type { AuthState, AuthActionTypes} from './auth.types'; 
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS, // Этот тип экшена может не использоваться если регистрация сразу логинит через LOGIN_SUCCESS
  REGISTER_FAILURE,
  LOGOUT,
} from './auth.types';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false, // Начальное состояние загрузки false
  error: null,
  token: localStorage.getItem('authToken'), // Загружаем токен при инициализации
};

// Убираем этот блок отсюда. Логика валидации токена перенесена в checkAuthStatus().
// if (initialState.token) {
// ...
// }

export const authReducer = (state = initialState, action: AuthActionTypes): AuthState => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST: // REGISTER_REQUEST также ставит loading: true
      return {
        ...state,
        loading: true,
        error: null,
      };
    case LOGIN_SUCCESS:
      localStorage.setItem('authToken', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case LOGIN_FAILURE:
    case REGISTER_FAILURE: // REGISTER_FAILURE также сбрасывает аутентификацию
      localStorage.removeItem('authToken');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case REGISTER_SUCCESS:
      // Этот кейс сейчас не используется активно, если регистрация сразу вызывает LOGIN_SUCCESS.
      // Если бы регистрация НЕ логинила автоматически, здесь можно было бы обработать
      // сообщение об успехе или какие-то другие данные.
      // Например, если action.payload содержит { message: string }
      // console.log('Registration successful:', action.payload?.message);
      return {
        ...state,
        loading: false,
        error: null,
        // Ничего не меняем в isAuthenticated, user, token, если логин происходит отдельно
        // или через LOGIN_SUCCESS
      };
    case LOGOUT:
      localStorage.removeItem('authToken');
      return {
        ...initialState, // Сбрасываем к начальному состоянию, но без токена
        token: null,
        isAuthenticated: false, // Явно указываем
        loading: false, // Убедимся, что загрузка сброшена
      };
    default:
      return state;
  }
};
