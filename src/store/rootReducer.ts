import { combineReducers } from 'redux';
// import { authReducer } from './auth/auth.reducer'; // <-- УДАЛЯЕМ ИЛИ КОММЕНТИРУЕМ СТАРЫЙ ИМПОРТ
import authSliceReducer from './authSlice'; // <-- ИМПОРТИРУЕМ РЕДЬЮСЕР ИЗ authSlice.ts
import { transactionsReducer } from './transactions/transactions.reducer'; 
import categoriesReducer from './categories/categoriesSlice'; 

const rootReducer = combineReducers({
  auth: authSliceReducer, // <-- ИСПОЛЬЗУЕМ РЕДЬЮСЕР ИЗ authSlice.ts
  transactions: transactionsReducer, 
  categories: categoriesReducer, 
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
