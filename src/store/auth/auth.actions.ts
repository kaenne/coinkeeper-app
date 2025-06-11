// src/store/auth/auth.actions.ts
import type { AppDispatch, RootState } from '../index'; // Предполагаем, что RootState тоже экспортируется
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
  LOGOUT,
} from './auth.types';
import * as authService from '../../services/authService';

// Типы для credentials и userData, если они не экспортируются из authService
interface LoginCredentials {
  email: string;
  password: string;
}
interface RegisterData extends LoginCredentials { /* ... */ }


export const loginUser = (credentials: LoginCredentials) => async (dispatch: AppDispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const data = await authService.login(credentials); // data = { user, token }
    dispatch({ type: LOGIN_SUCCESS, payload: data });
    // Можно сохранить токен в localStorage здесь или в редьюсере
    // localStorage.setItem('authToken', data.token); // Лучше делать в редьюсере для консистентности
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to login';
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });
  }
};

export const registerUser = (userData: RegisterData) => async (dispatch: AppDispatch) => {
  dispatch({ type: REGISTER_REQUEST });
  try {
    const response = await authService.register(userData);
    // Предположим, что успешная регистрация сразу логинит пользователя
    // Если API возвращает { user, token } при успешной регистрации:
    if ('token' in response && 'user' in response) {
      dispatch({ type: LOGIN_SUCCESS, payload: { user: response.user, token: response.token } });
      // dispatch({ type: REGISTER_SUCCESS }); // Можно диспатчить и REGISTER_SUCCESS для аналитики, например
    } else {
      // Если API возвращает только сообщение, например, "Регистрация успешна, подтвердите email"
      // dispatch({ type: REGISTER_SUCCESS, payload: response.message }); // или просто REGISTER_SUCCESS без payload
      // В этом случае пользователь не будет залогинен автоматически.
      // Для данного ТЗ, вероятно, ожидается автоматический вход.
      // Если API не возвращает user/token при регистрации, а требует отдельного логина:
      dispatch({ type: REGISTER_SUCCESS }); // Просто флаг успеха, затем пользователь должен будет войти
      // Или запросить логин после успешной регистрации
      // dispatch(loginUser({ email: userData.email, password: userData.password }));
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to register';
    dispatch({ type: REGISTER_FAILURE, payload: errorMessage });
  }
};

export const logoutAction = () => (dispatch: AppDispatch, getState: () => RootState) => {
  const token = getState().auth.token;
  // localStorage.removeItem('authToken'); // Лучше делать в редьюсере
  dispatch({ type: LOGOUT });
  if (token) {
     authService.logoutUserServer(token).catch(err => console.error("Server logout error", err)); // Не блокирующий вызов
  }
  // Здесь также можно диспатчить сброс состояния для других редьюсеров, если необходимо
  // dispatch({ type: 'RESET_TRANSACTIONS_STATE' });
  // dispatch({ type: 'RESET_CATEGORIES_STATE' });
};

export const checkAuthStatus = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  const token = getState().auth.token || localStorage.getItem('authToken'); // Проверяем и стейт и localStorage

  if (token) {
    dispatch({ type: LOGIN_REQUEST }); // Показываем загрузку
    try {
      // Здесь мы могли бы сначала попытаться получить пользователя из localStorage, если он там есть
      // и если токен не протух (требует парсинга JWT).
      // Но более надежно - запросить данные пользователя с сервера.
      const user = await authService.fetchMe(token);
      dispatch({ type: LOGIN_SUCCESS, payload: { user, token } });
    } catch (error: any) {
      // Если токен невалиден (например, 401 ошибка от API)
      const errorMessage = error.response?.data?.message || error.message || 'Session expired or token invalid';
      dispatch({ type: LOGIN_FAILURE, payload: errorMessage }); // Это приведет к очистке токена в редьюсере
      // dispatch(logoutAction()); // или просто вызвать logoutAction, который сделает то же самое
    }
  } else {
    // Если токена нет, ничего не делаем, пользователь не аутентифицирован
    // или можно диспатчить LOGOUT для явного сброса, если это не сделано при инициализации
    if (getState().auth.isAuthenticated) { // Если вдруг в стейте он аутентифицирован без токена
        dispatch({ type: LOGOUT });
    }
  }
};
