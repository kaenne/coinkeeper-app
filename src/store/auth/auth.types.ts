// Типы экшенов для аутентификации
export const LOGIN_REQUEST = 'auth/LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'auth/LOGIN_FAILURE';

export const REGISTER_REQUEST = 'auth/REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'auth/REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'auth/REGISTER_FAILURE';

export const LOGOUT = 'auth/LOGOUT';

// Интерфейс для пользователя (можно расширить)
export interface User {
  id: string;
  email: string;
  password?: string; // Добавлено опциональное поле password
  // другие поля пользователя
}

// Интерфейс для состояния аутентификации
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null; // Для хранения JWT токена
}

// Типы для экшенов (можно детализировать для каждого экшена)
interface LoginRequestAction {
  type: typeof LOGIN_REQUEST;
}

interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  payload: { user: User; token: string };
}

interface LoginFailureAction {
  type: typeof LOGIN_FAILURE;
  payload: string; // Сообщение об ошибке
}

interface RegisterRequestAction {
  type: typeof REGISTER_REQUEST;
}

interface RegisterSuccessAction {
  type: typeof REGISTER_SUCCESS;
  // Можно вернуть пользователя или просто подтверждение
}

interface RegisterFailureAction {
  type: typeof REGISTER_FAILURE;
  payload: string; // Сообщение об ошибке
}

interface LogoutAction {
  type: typeof LOGOUT;
}

export type AuthActionTypes =
  | LoginRequestAction
  | LoginSuccessAction
  | LoginFailureAction
  | RegisterRequestAction
  | RegisterSuccessAction
  | RegisterFailureAction
  | LogoutAction;
