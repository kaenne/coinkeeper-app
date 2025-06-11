import React, { useState, useEffect } from 'react'; // Добавлен импорт React
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '../store/authSlice';
import type { AppDispatch } from '../store';
import Button from '../components/Button/Button';
import { useTheme } from '../hooks/useTheme'; // Импортируем хук useTheme
import './RegistrationPage.css';

function RegistrationPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [theme, toggleTheme] = useTheme(); // Используем хук useTheme

  // Этот useEffect полезен, если пользователь уже аутентифицирован
  // или если регистрация автоматически логинит пользователя.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault();
    if (password !== confirmPassword) {
      // Вместо alert, лучше установить локальное состояние ошибки или использовать глобальное, если оно есть
      // dispatch(setAuthError("Пароли не совпадают!")); // Пример, если бы у вас был такой action
      alert("Пароли не совпадают!"); // Пока оставим alert для простоты
      return;
    }
    dispatch(registerUser({ email, password }))
      .unwrap()
      .then(() => {
        // Успешная регистрация и вход, isAuthenticated обновится, и useEffect выше сделает navigate.
        // navigate('/');
      })
      .catch((errorPayload: string) => { 
        console.error('Registration attempt failed. Error message from slice:', errorPayload);
        // Сообщение об ошибке для пользователя уже будет отображено через useSelector(selectAuthError)
      });
  };

  return (
    <div className="registration-page-container">
      <button onClick={toggleTheme} className="theme-toggle-button page-theme-toggle-button">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <div className="registration-form-container">
        <h1>Регистрация</h1>
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} // Типизирован 'e'
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" variant="primary" className="btn-register" disabled={isLoading}>
            {isLoading ? <span className="loading-text">Регистрация...</span> : 'Зарегистрироваться'}
          </Button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div className="login-link-container">
          Уже есть аккаунт? <Link to="/login" className="login-link">Войдите</Link>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;
