import React, { useState } from 'react'; // Добавлен импорт React
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectIsAuthenticated, selectUser } from '../../store/authSlice';
import type { AppDispatch } from '../../store';
import { useTheme } from '../../hooks/useTheme'; // Импортируем хук
import './Header.css';
import logo from '../../assets/logo.svg'; // Убедитесь, что путь к лого корректен

const Header = () => { // Убрали React.FC
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, toggleTheme] = useTheme(); // Используем хук

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsMobileMenuOpen(false); // Закрыть меню при выходе
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinkClassName = ({ isActive }: { isActive: boolean }) => 
    isActive ? 'nav-link active-link' : 'nav-link';

  return (
    <header className="app-header">
      <Link to="/" className="logo-link" onClick={closeMobileMenu}>
        <img src={logo} alt="CoinKeeper Logo" className="logo-image" />
        <span className="logo-text">CoinKeeper</span>
      </Link>

      {/* Кнопка бургер-меню */}
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle navigation">
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Навигация для десктопа */}
      <nav className="desktop-nav">
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" className={navLinkClassName}>
              Обзор
            </NavLink>
            <NavLink to="/categories" className={navLinkClassName}>
              Категории
            </NavLink>
            <NavLink to="/statistics" className={navLinkClassName}>
              Статистика
            </NavLink>
            <div className="user-info">
              {user?.email && <span className="user-email">{user.email}</span>}
              <button onClick={handleLogout} className="nav-button logout-button">
                Выйти
              </button>
              <button onClick={toggleTheme} className="theme-toggle-button nav-button">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          </>
        ) : (
          <>
            <NavLink to="/login" className={navLinkClassName}>
              Войти
            </NavLink>
            <NavLink to="/register" className={navLinkClassName}>
              Регистрация
            </NavLink>
          </>
        )}
      </nav>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <nav className="mobile-nav" onClick={(e: React.MouseEvent) => e.stopPropagation()}> {/* Предотвращаем закрытие при клике на само меню */}
            <button onClick={toggleTheme} className="theme-toggle-button mobile-theme-toggle-button">
              Сменить тему: {theme === 'light' ? '🌙 Темная' : '☀️ Светлая'}
            </button>
            {isAuthenticated ? (
              <>
                {user?.email && <span className="user-email mobile-user-email">{user.email}</span>}
                <NavLink to="/dashboard" className={navLinkClassName} onClick={closeMobileMenu}>
                  Обзор
                </NavLink>
                <NavLink to="/categories" className={navLinkClassName} onClick={closeMobileMenu}>
                  Категории
                </NavLink>
                <NavLink to="/statistics" className={navLinkClassName} onClick={closeMobileMenu}>
                  Статистика
                </NavLink>
                <button onClick={handleLogout} className="nav-button logout-button mobile-logout-button">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClassName} onClick={closeMobileMenu}>
                  Войти
                </NavLink>
                <NavLink to="/register" className={navLinkClassName} onClick={closeMobileMenu}>
                  Регистрация
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
