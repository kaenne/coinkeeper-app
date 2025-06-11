import axios from 'axios';
import type { User } from '../store/auth/auth.types';

const API_BASE_URL = 'http://localhost:3001'; // Base URL for json-server

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  // name?: string; // If you add a name field to registration
}

interface AuthResponse {
  user: User; // User здесь будет без password
  token: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // 1. Fetch user by email
  const response = await axios.get<User[]>(`${API_BASE_URL}/users?email=${credentials.email}`);
  const users = response.data;

  if (users.length === 0) {
    throw new Error('User not found');
  }

  const user = users[0]; 

  // DEBUGGING LOGS:
  console.log('User from server:', user);
  console.log('Password from server (user.password):', user.password);
  console.log('Password from input (credentials.password):', credentials.password);

  // 2. Compare password (plain text comparison for mock server)
  if (user.password !== credentials.password) { 
    console.error('Password comparison failed!'); // Добавим лог при ошибке сравнения
    throw new Error('Invalid password');
  }
  console.log('Password comparison successful!'); // Добавим лог при успехе

  // 3. Generate a mock token (e.g., including user ID)
  // Этот токен будет сохранен в localStorage и Redux state.
  const token = `mock-jwt-token-${user.id}`; 
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user; // Удаляем password
  return { user: userWithoutPassword, token };
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  // 1. Check if user already exists
  const checkUserResponse = await axios.get<User[]>(`${API_BASE_URL}/users?email=${userData.email}`);
  if (checkUserResponse.data.length > 0) {
    throw new Error('User with this email already exists');
  }

  // 2. Create new user
  const newUserPayload = {
    email: userData.email,
    password: userData.password, 
  };
  const registerResponse = await axios.post<User>(`${API_BASE_URL}/users`, newUserPayload);
  const newUser = registerResponse.data; // newUser здесь будет содержать password из db.json

  // 3. Generate a mock token for the new user (for auto-login)
  const token = `mock-jwt-token-${newUser.id}`;
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = newUser; // Удаляем password
  return { user: userWithoutPassword, token };
};

export const fetchMe = async (token: string): Promise<User> => {
  // Эта функция имитирует запрос к защищенному эндпоинту "/me" или "/profile"
  // В реальном приложении сервер бы валидировал настоящий JWT.
  // Здесь мы "валидируем" наш mock-токен, извлекая из него userId.
  if (!token || !token.startsWith('mock-jwt-token-')) {
    throw new Error('Invalid or missing mock token');
  }

  const userId = token.split('mock-jwt-token-')[1];
  if (!userId) {
    throw new Error('Invalid mock token format: User ID missing');
  }

  try {
    // Запрашиваем пользователя по ID, извлеченному из mock-токена.
    const response = await axios.get<User>(`${API_BASE_URL}/users/${userId}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = response.data; // Удаляем password
    return userWithoutPassword;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('User associated with token not found');
    }
    throw new Error('Failed to fetch user details');
  }
};

export const logoutUserServer = async (_token: string): Promise<void> => {
  // For a mock server, there's usually no server-side logout endpoint to call.
  // This function can be a no-op or log a message.
  console.log('Mock server logout called. No server action taken.');
  return Promise.resolve();
};
