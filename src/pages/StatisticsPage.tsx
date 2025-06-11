import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { RootState, AppDispatch } from '../store';
import { fetchTransactions } from '../store/transactions/transactions.actions';
import { fetchCategories, selectAllCategories } from '../store/categories/categoriesSlice';
import { selectUser } from '../store/authSlice'; // Импортируем селектор пользователя
import { getMonthYear, getStartOfMonth, getEndOfMonth, formatDateForAxis } from '../utils/dateUtils';
import './StatisticsPage.css'; // Подключаем стили

// Цвета для диаграммы (можно расширить, будет использоваться как fallback)
const FALLBACK_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF00AA'];

// Interface for the data structure used in charts
interface ChartSpendingData {
  name: string;
  value: number;
  color?: string;
  icon?: string;
}

function StatisticsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const transactions = useSelector((state: RootState) => state.transactions.items);
  const allCategories = useSelector(selectAllCategories); 
  const transactionsLoading = useSelector((state: RootState) => state.transactions.loading);
  const categoriesLoading = useSelector((state: RootState) => state.categories.loading);
  const currentUser = useSelector(selectUser); 

  const [selectedPeriod, setSelectedPeriod] = useState<string>('currentMonth'); 
  const [currentMonthYear, setCurrentMonthYear] = useState<string>(getMonthYear(new Date()));

  useEffect(() => {
    const userId = currentUser?.id;
    if (userId) { 
      // Условие для загрузки можно упростить, если данные просто отсутствуют
      // или если мы хотим всегда обновлять их при заходе на страницу (менее оптимально)
      // Для начала, убедимся, что они вообще запрашиваются, если их нет
      if (!transactions.length) { // Или более сложная логика, если нужно проверять принадлежность userId
        dispatch(fetchTransactions());
      }
      if (!allCategories.length) { // Аналогично для категорий
        dispatch(fetchCategories());
      }
    }
  }, [dispatch, currentUser?.id]); // Убрал transactions и allCategories из зависимостей,
                                   // чтобы избежать лишних перезапросов при их обновлении.
                                   // Загрузка будет инициироваться только при смене пользователя или первой загрузке.

  const filteredTransactions = useMemo(() => {
    try {
      if (!transactions || transactions.length === 0) return [];
      console.log('[StatisticsPage] Recalculating filteredTransactions. Input transactions count:', transactions.length);

      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      switch (selectedPeriod) {
        case 'currentMonth': {
          const [year, month] = currentMonthYear.split('-').map(Number);
          startDate = getStartOfMonth(year, month - 1);
          endDate = getEndOfMonth(year, month - 1);
          break;
        }
        case 'lastMonth': {
          const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          startDate = getStartOfMonth(lastMonthDate.getFullYear(), lastMonthDate.getMonth());
          endDate = getEndOfMonth(lastMonthDate.getFullYear(), lastMonthDate.getMonth());
          break;
        }
        case 'currentYear':
          startDate = new Date(now.getFullYear(), 0, 1); // Начало текущего года
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // Конец текущего года
          break;
        case 'all':
        default:
          return transactions; // Возвращаем все транзакции
      }
      
      if (!startDate || !endDate) return transactions;

      const result = transactions.filter(t => {
        if (!t || !t.date) { // Добавим проверку на t и t.date
          console.warn('[StatisticsPage] Invalid transaction object in filteredTransactions:', t);
          return false;
        }
        const transactionDate = new Date(t.date);
        // Проверим, что дата валидна
        if (isNaN(transactionDate.getTime())) {
            console.warn('[StatisticsPage] Invalid date in transaction for filteredTransactions:', t);
            return false;
        }
        return transactionDate >= startDate! && transactionDate <= endDate!;
      });
      console.log('[StatisticsPage] filteredTransactions result count:', result.length);
      return result;
    } catch (error) {
      console.error("Error calculating filteredTransactions:", error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }, [transactions, selectedPeriod, currentMonthYear]);


  const spendingByCategory: ChartSpendingData[] = useMemo(() => {
    try {
      console.log('[StatisticsPage] Recalculating spendingByCategory. Filtered transactions count:', filteredTransactions.length, 'Categories count:', allCategories.length);
      if (!filteredTransactions || filteredTransactions.length === 0 || !allCategories || allCategories.length === 0) {
        console.log('[StatisticsPage] spendingByCategory: Not enough data, returning empty array.');
        return [];
      }
      const expenseTransactions = filteredTransactions.filter(t => t && t.type === 'expense'); // Добавим проверку на t
      const spendingMap: Record<string, { value: number, color?: string, icon?: string }> = {};

      expenseTransactions.forEach(transaction => {
        if (!transaction || typeof transaction.category !== 'string' || !transaction.category.trim()) { // Добавим проверку на transaction
          console.warn('[StatisticsPage] Transaction with invalid category name:', transaction);
          return; 
        }
        const categoryName = transaction.category;
        const categoryDetails = allCategories.find(cat => cat.name === categoryName);

        // Если категория не найдена, можно присвоить "Без категории" или пропустить
        const displayName = categoryDetails ? categoryName : `Без категории (${categoryName})`;
        const displayColor = categoryDetails?.color;
        const displayIcon = categoryDetails?.icon;

        if (!spendingMap[displayName]) {
          spendingMap[displayName] = { 
            value: 0, 
            color: displayColor, 
            icon: displayIcon 
          };
        }
        spendingMap[displayName].value += transaction.amount;
      });

      const result = Object.entries(spendingMap).map(([name, data]) => ({
        name, 
        value: typeof data.value === 'number' ? data.value : 0, 
        color: data.color,
        icon: data.icon,
      })).sort((a, b) => b.value - a.value);
      console.log('[StatisticsPage] spendingByCategory result:', result);
      return result;
    } catch (error) {
      console.error("Error calculating spendingByCategory:", error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }, [filteredTransactions, allCategories]);

  const totalIncome = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return 0;
    return filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    if (!spendingByCategory || spendingByCategory.length === 0) return 0;
    return spendingByCategory.reduce((sum, categorySpending) => sum + categorySpending.value, 0);
  }, [spendingByCategory]);

  const dailyChartData = useMemo(() => {
    try {
      console.log('[StatisticsPage] Recalculating dailyChartData. Filtered transactions count:', filteredTransactions.length);
      if (!filteredTransactions || filteredTransactions.length === 0) {
        console.log('[StatisticsPage] dailyChartData: No filtered transactions, returning empty array.');
        return [];
      }

      const dataMap: Record<string, { date: string; income: number; expense: number }> = {};

      filteredTransactions.forEach(t => {
        if (!t || typeof t.date !== 'string' || !t.date.trim()) { // Добавим проверку на t
          console.warn('[StatisticsPage] Transaction with invalid date:', t);
          return; 
        }
        const dateKey = t.date.split('T')[0]; 
        if (!dataMap[dateKey]) {
          dataMap[dateKey] = { date: dateKey, income: 0, expense: 0 };
        }
        const amount = (t && typeof t.amount === 'number') ? t.amount : 0; // Добавим проверку на t
        if (t.type === 'income') {
          dataMap[dateKey].income += amount;
        } else if (t.type === 'expense') {
          dataMap[dateKey].expense += amount;
        }
      });
    
      const result = Object.values(dataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      console.log('[StatisticsPage] dailyChartData result:', result);
      return result;
    } catch (error) {
      console.error("Error calculating dailyChartData:", error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }, [filteredTransactions]);

  // Генерация списка месяцев для выбора - ПЕРЕМЕЩЕНО ВЫШЕ
  const monthOptions = useMemo(() => {
    try { 
      if (!transactions || transactions.length === 0) return [getMonthYear(new Date())]; 
      const options = new Set<string>();
      transactions.forEach(t => {
        if (t && t.date) { 
            const transactionDate = new Date(t.date);
            if (!isNaN(transactionDate.getTime())) { 
                 options.add(getMonthYear(transactionDate));
            } else {
                console.warn("[StatisticsPage] Invalid date in transaction for monthOptions:", t);
            }
        } else {
            console.warn("[StatisticsPage] Invalid transaction object for monthOptions:", t);
        }
      });
      options.add(getMonthYear(new Date()));
      return Array.from(options).sort().reverse(); 
    } catch (error) {
        console.error("Error calculating monthOptions:", error);
        return [getMonthYear(new Date())]; 
    }
  }, [transactions]);


  if (!currentUser) { 
    return <div className="loading-message" style={{ padding: '20px' }}>Аутентификация...</div>;
  }
  
  if (transactionsLoading || categoriesLoading) {
    return <div className="loading-message" style={{ padding: '20px' }}>Загрузка данных для статистики...</div>;
  }

  // Дополнительная проверка перед рендерингом графиков
  const safeSpendingByCategory = Array.isArray(spendingByCategory) ? spendingByCategory : [];
  const safeDailyChartData = Array.isArray(dailyChartData) ? dailyChartData : [];

  return (
    <div className="statistics-page-container">
      <h1>Статистика</h1>

      <div className="period-filter-container">
        <label htmlFor="period-select">Период:</label>
        <select 
          id="period-select"
          value={selectedPeriod} 
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="currentMonth">Текущий выбранный месяц</option>
          <option value="lastMonth">Прошлый месяц</option>
          <option value="currentYear">Текущий год</option>
          <option value="all">За все время</option>
        </select>

        {selectedPeriod === 'currentMonth' && (
          <select
            value={currentMonthYear}
            onChange={(e) => setCurrentMonthYear(e.target.value)}
          >
            {monthOptions.map(monthStr => (
              <option key={monthStr} value={monthStr}>
                {new Date(monthStr + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="totals-summary-container">
        <div>
          <h2>Общий доход</h2>
          <p className="income-total">
            {totalIncome.toLocaleString('ru-RU', { style: 'currency', currency: 'KZT' })}
          </p>
        </div>
        <div>
          <h2>Общий расход</h2>
          <p className="expense-total">
            {totalExpenses.toLocaleString('ru-RU', { style: 'currency', currency: 'KZT' })}
          </p>
        </div>
      </div>

      <h2>Расходы по категориям {selectedPeriod !== 'all' && `(за ${
          selectedPeriod === 'currentMonth' ? new Date(currentMonthYear + '-01').toLocaleString('default', { month: 'long', year: 'numeric' }) :
          selectedPeriod === 'lastMonth' ? 'прошлый месяц' :
          selectedPeriod === 'currentYear' ? 'текущий год' : ''
        })`}
      </h2>
      {safeSpendingByCategory.length > 0 ? (
        <div className="chart-container">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={safeSpendingByCategory} 
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8" // Этот fill теперь будет переопределен <Cell>
                dataKey="value"
                nameKey="name"
                label={({ name, percent, icon }: ChartSpendingData & { percent: number }) => `${icon ? icon + ' ' : ''}${name} ${(percent * 100).toFixed(0)}%`}
              >
                {safeSpendingByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name, props) => {
                const payload = props.payload as ChartSpendingData | undefined;
                return [`${value.toLocaleString('ru-RU')} ₸`, `${payload?.icon ? payload.icon + ' ' : ''}${name}`];
              }} />
              <Legend 
                formatter={(value, entry) => {
                  const { color } = entry;
                  // Type assertion for entry.payload to access custom properties like 'icon'
                  const payload = entry.payload as ChartSpendingData | undefined;
                  return (
                    <span style={{ color }}>
                      {payload?.icon && `${payload.icon} `}{value}
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="no-data-message">Нет данных о расходах для отображения диаграммы.</p>
      )}

      <h2>Динамика доходов и расходов {selectedPeriod !== 'all' && `(за ${
          selectedPeriod === 'currentMonth' ? new Date(currentMonthYear + '-01').toLocaleString('default', { month: 'long', year: 'numeric' }) :
          selectedPeriod === 'lastMonth' ? 'прошлый месяц' :
          selectedPeriod === 'currentYear' ? 'текущий год' : ''
        })`}
      </h2>
      {safeDailyChartData.length > 0 ? (
        <div className="chart-container">
          <ResponsiveContainer>
            <BarChart
              data={safeDailyChartData} 
              margin={{
                top: 20, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDateForAxis} />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₸`} />
              <Legend />
              <Bar dataKey="income" fill="#82ca9d" name="Доходы" />
              <Bar dataKey="expense" fill="#fa8072" name="Расходы" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="no-data-message">Нет данных для отображения динамики доходов и расходов.</p>
      )}

      <h3>Детализация расходов {selectedPeriod !== 'all' && `(за ${
          selectedPeriod === 'currentMonth' ? new Date(currentMonthYear + '-01').toLocaleString('default', { month: 'long', year: 'numeric' }) :
          selectedPeriod === 'lastMonth' ? 'прошлый месяц' :
          selectedPeriod === 'currentYear' ? 'текущий год' : ''
        })`}
      :</h3>
      {safeSpendingByCategory.length > 0 ? (
        <ul className="expense-details-list">
          {safeSpendingByCategory.map((item, index) => (
            <li key={index}>
              <span className="category-info">
                {item.icon && <span className="category-icon" style={{ color: item.color }}>{item.icon}</span>}
                <span className="category-name" style={{ borderLeft: item.color ? `3px solid ${item.color}` : 'none', paddingLeft: item.color ? '5px' : '0' }}>
                  {item.name} {/* Убедитесь, что item.name всегда строка */}
                </span>
              </span>
              <span className="category-amount">
                {typeof item.value === 'number' ? item.value.toLocaleString('ru-RU', { style: 'currency', currency: 'KZT' }) : 'N/A'} {/* Проверка на number */}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-data-message">Нет данных о расходах.</p>
      )}

      {/* Здесь можно будет добавить другие графики, например, доходы/расходы по времени */}
    </div>
  );
}

export default StatisticsPage;
