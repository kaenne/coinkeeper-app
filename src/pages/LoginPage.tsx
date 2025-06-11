import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../store/authSlice';
import type { AppDispatch } from '../store';
import Button from '../components/Button/Button';
import { useTheme } from '../hooks/useTheme'; // Импортируем хук useTheme
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [theme, toggleTheme] = useTheme(); // Используем хук useTheme

  // Этот useEffect все еще полезен, если пользователь уже аутентифицирован
  // и случайно попадает на страницу /login (например, через history back)
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault();
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        // Успешный вход, isAuthenticated обновится, и useEffect выше сделает navigate.
        // navigate('/'); // Можно оставить, если хотите немедленного перехода, не дожидаясь ререндера от isAuthenticated
      })
      .catch((errorPayload: string) => { 
        // errorPayload здесь будет строкой, которую вернул rejectWithValue
        console.error('Login attempt failed. Error message from slice:', errorPayload);
        // Сообщение об ошибке для пользователя уже будет отображено через useSelector(selectAuthError)
      });
  };

  return (
    <div className="login-page-container">
      <button onClick={toggleTheme} className="theme-toggle-button page-theme-toggle-button">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <div className="login-form-container">
        <h1>Вход в систему</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} // Типизирован 'e'
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} // Типизирован 'e'
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" variant="primary" className="btn-login" disabled={isLoading}>
            {isLoading ? <span className="loading-text">Вход...</span> : 'Войти'}
          </Button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div className="register-link-container">
          Нет аккаунта? <Link to="/register" className="register-link">Зарегистрируйтесь</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
