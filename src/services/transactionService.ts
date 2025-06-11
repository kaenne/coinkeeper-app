// src/services/transactionService.ts
import axios from 'axios';
import type { Transaction } from '../store/transactions/transactions.types';

const API_URL = 'http://localhost:3001'; // URL нашего json-server

// Получить все транзакции для конкретного пользователя
export const getAllTransactions = async (userId: string): Promise<Transaction[]> => {
  const response = await axios.get(`${API_URL}/transactions?userId=${userId}`);
  return response.data;
};

// Добавить новую транзакцию
// Тип для данных новой транзакции (без id, так как json-server его сгенерирует)
// Transaction теперь содержит userId, поэтому NewTransactionData тоже будет его ожидать
export type NewTransactionData = Omit<Transaction, 'id'>;

export const addTransaction = async (transactionData: NewTransactionData): Promise<Transaction> => {
  // userId уже должен быть в transactionData, добавленный в thunk/action
  const response = await axios.post(`${API_URL}/transactions`, transactionData);
  return response.data;
};

// Обновить существующую транзакцию
export const updateTransaction = async (transactionId: string, transactionData: Partial<Transaction>): Promise<Transaction> => {
  const response = await axios.put(`${API_URL}/transactions/${transactionId}`, transactionData);
  return response.data;
};

// Удалить транзакцию
export const deleteTransaction = async (transactionId: string): Promise<{}> => {
  const response = await axios.delete(`${API_URL}/transactions/${transactionId}`);
  return response.data; // json-server возвращает пустой объект {} при успешном удалении
};
