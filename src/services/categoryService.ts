import axios from 'axios';
import type { Category, NewCategoryData } from '../store/categories/categories.types'; 

const API_URL = 'http://localhost:3001'; 

// Получить все категории для конкретного пользователя
export const getAllCategories = async (userId: string): Promise<Category[]> => {
  const response = await axios.get(`${API_URL}/categories?userId=${userId}`);
  return response.data;
};

// Добавить новую категорию
// NewCategoryData теперь будет включать userId
export const addCategory = async (categoryData: NewCategoryData): Promise<Category> => {
  // userId уже должен быть в categoryData, добавленный в thunk
  const response = await axios.post(`${API_URL}/categories`, categoryData);
  return response.data;
};

// Обновить существующую категорию
export const updateCategory = async (categoryId: string, categoryData: Partial<Category>): Promise<Category> => {
  const response = await axios.put(`${API_URL}/categories/${categoryId}`, categoryData);
  return response.data;
};

// Удалить категорию
export const deleteCategory = async (categoryId: string): Promise<{}> => {
  const response = await axios.delete(`${API_URL}/categories/${categoryId}`);
  return response.data; // json-server возвращает пустой объект {} при успешном удалении
};
