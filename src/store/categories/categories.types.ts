// Интерфейс для одной категории
export interface Category {
  id: string;
  userId: string; // <-- Добавлено поле для идентификатора пользователя
  name: string;
  icon?: string; // Emoji, имя класса иконки (например, FontAwesome) или URL SVG
  color?: string; // HEX-код цвета, например, '#FF0000'
}

// Интерфейс для состояния категорий в Redux store
export interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

// Типы экшенов (используем подход с createSlice позже, но типы могут быть полезны для понимания)
// Для createSlice они будут генерироваться автоматически, но для thunks могут понадобиться
export const FETCH_CATEGORIES_REQUEST = 'categories/FETCH_CATEGORIES_REQUEST';
export const FETCH_CATEGORIES_SUCCESS = 'categories/FETCH_CATEGORIES_SUCCESS';
export const FETCH_CATEGORIES_FAILURE = 'categories/FETCH_CATEGORIES_FAILURE';

export const ADD_CATEGORY_REQUEST = 'categories/ADD_CATEGORY_REQUEST';
export const ADD_CATEGORY_SUCCESS = 'categories/ADD_CATEGORY_SUCCESS';
export const ADD_CATEGORY_FAILURE = 'categories/ADD_CATEGORY_FAILURE';

export const EDIT_CATEGORY_REQUEST = 'categories/EDIT_CATEGORY_REQUEST';
export const EDIT_CATEGORY_SUCCESS = 'categories/EDIT_CATEGORY_SUCCESS';
export const EDIT_CATEGORY_FAILURE = 'categories/EDIT_CATEGORY_FAILURE';

export const DELETE_CATEGORY_REQUEST = 'categories/DELETE_CATEGORY_REQUEST';
export const DELETE_CATEGORY_SUCCESS = 'categories/DELETE_CATEGORY_SUCCESS';
export const DELETE_CATEGORY_FAILURE = 'categories/DELETE_CATEGORY_FAILURE';

// Типы для данных новой категории (без id)
// NewCategoryData будет включать userId, так как Category его теперь включает
export type NewCategoryData = Omit<Category, 'id'>;

// Тип для данных, передаваемых в thunk для создания категории
export type CategoryForCreation = Pick<Category, 'name' | 'icon' | 'color'>;
