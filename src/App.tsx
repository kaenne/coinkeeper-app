import { useEffect } from 'react'; 
import { Routes, Route, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux'; 
import { checkAuthStatus } from './store/authSlice'; 
import type { AppDispatch } from './store'; 
import { useTheme } from './hooks/useTheme'; // Импортируем хук

// Импорты страниц
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import StatisticsPage from './pages/StatisticsPage';
import Header from './components/Header/Header'; 

const App = () => { 
  const dispatch = useDispatch<AppDispatch>(); 
  useTheme(); // Инициализируем и применяем тему

  useEffect(() => {
    // Восстанавливаем автоматическую проверку статуса
    dispatch(checkAuthStatus());
  }, [dispatch]);

  console.log('App.tsx rendering with Header and checkAuthStatus enabled');

  return (
    <>
      <Header /> 
      <main style={{ padding: '20px' }}> 
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>Добро пожаловать в CoinKeeper!</h1>
              <p>Используйте навигацию выше для перехода по разделам.</p>
              <p>Если вы не авторизованы, пожалуйста, <Link to="/login">войдите</Link> или <Link to="/register">зарегистрируйтесь</Link>.</p>
            </div>
          } />
          <Route path="*" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h2>404 - Страница не найдена</h2>
              <p>Запрошенная страница не существует. Вернитесь на <Link to="/">главную</Link>.</p>
            </div>
          } />
        </Routes>
      </main>
    </>
  );
};

export default App;