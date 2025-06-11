import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer'; // Импортируем rootReducer

export const store = configureStore({
  reducer: rootReducer, // Используем rootReducer
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;