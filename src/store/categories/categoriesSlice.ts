import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { Category, CategoriesState, NewCategoryData, CategoryForCreation } from './categories.types'; 
import * as categoryService from '../../services/categoryService';

// Async Thunks
export const fetchCategories = createAsyncThunk<
  Category[], 
  void,       
  { rejectValue: string; state: RootState } 
>('categories/fetchCategories', async (_, { getState, rejectWithValue }) => {
  try {
    const userId = getState().auth.user?.id;
    if (!userId) {
      return rejectWithValue('User not authenticated');
    }
    const categories = await categoryService.getAllCategories(userId);
    return categories;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch categories');
  }
});

export const addCategory = createAsyncThunk<
  Category,
  CategoryForCreation, // Тип входных данных от компонента
  { rejectValue: string; state: RootState }
>('categories/addCategory', async (categoryDetails, { getState, rejectWithValue }) => {
  try {
    const userId = getState().auth.user?.id;
    if (!userId) {
      return rejectWithValue('User not authenticated');
    }
    const categoryDataWithUser: NewCategoryData = {
      ...categoryDetails,
      userId,
    };
    const newCategory = await categoryService.addCategory(categoryDataWithUser);
    return newCategory;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to add category');
  }
});

export const editCategory = createAsyncThunk<
  Category,
  { id: string; categoryData: Partial<Category> }, 
  { rejectValue: string }
>('categories/editCategory', async ({ id, categoryData }, { rejectWithValue }) => {
  try {
    // В реальном API здесь бы тоже проверялся userId перед обновлением
    const updatedCategory = await categoryService.updateCategory(id, categoryData);
    return updatedCategory;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to edit category');
  }
});

export const deleteCategory = createAsyncThunk<
  string, 
  string, 
  { rejectValue: string }
>('categories/deleteCategory', async (categoryId, { rejectWithValue }) => {
  try {
    // В реальном API здесь бы тоже проверялся userId перед удалением
    await categoryService.deleteCategory(categoryId);
    return categoryId;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to delete category');
  }
});


const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Здесь можно добавить обычные редьюсеры, если они понадобятся
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Category
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.items.push(action.payload);
        state.loading = false;
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Edit Category
      .addCase(editCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        const index = state.items.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(editCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(cat => cat.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Селекторы
export const selectAllCategories = (state: RootState) => state.categories.items;
export const selectCategoriesLoading = (state: RootState) => state.categories.loading;
export const selectCategoriesError = (state: RootState) => state.categories.error;

export default categoriesSlice.reducer;
