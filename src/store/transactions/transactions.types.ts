// src/store/transactions/transactions.types.ts

// Интерфейс для одной транзакции
export interface Transaction {
  id: string;
  userId: string; // <-- Добавлено поле для идентификатора пользователя
  type: 'income' | 'expense';
  amount: number;
  category: string; // В будущем это может быть объект категории
  date: string; // Рекомендуется использовать формат ISO, например, YYYY-MM-DD
  comment?: string; // Необязательный комментарий
}

// Интерфейс для состояния транзакций в Redux store
export interface TransactionsState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
}

// Типы экшенов для транзакций
export const FETCH_TRANSACTIONS_REQUEST = 'transactions/FETCH_TRANSACTIONS_REQUEST';
export const FETCH_TRANSACTIONS_SUCCESS = 'transactions/FETCH_TRANSACTIONS_SUCCESS';
export const FETCH_TRANSACTIONS_FAILURE = 'transactions/FETCH_TRANSACTIONS_FAILURE';

export const ADD_TRANSACTION_REQUEST = 'transactions/ADD_TRANSACTION_REQUEST';
export const ADD_TRANSACTION_SUCCESS = 'transactions/ADD_TRANSACTION_SUCCESS';
export const ADD_TRANSACTION_FAILURE = 'transactions/ADD_TRANSACTION_FAILURE';

export const EDIT_TRANSACTION_REQUEST = 'transactions/EDIT_TRANSACTION_REQUEST';
export const EDIT_TRANSACTION_SUCCESS = 'transactions/EDIT_TRANSACTION_SUCCESS';
export const EDIT_TRANSACTION_FAILURE = 'transactions/EDIT_TRANSACTION_FAILURE';

export const DELETE_TRANSACTION_REQUEST = 'transactions/DELETE_TRANSACTION_REQUEST';
export const DELETE_TRANSACTION_SUCCESS = 'transactions/DELETE_TRANSACTION_SUCCESS';
export const DELETE_TRANSACTION_FAILURE = 'transactions/DELETE_TRANSACTION_FAILURE';

// Определения типов для каждого экшена

// Fetch
interface FetchTransactionsRequestAction {
  type: typeof FETCH_TRANSACTIONS_REQUEST;
}
interface FetchTransactionsSuccessAction {
  type: typeof FETCH_TRANSACTIONS_SUCCESS;
  payload: Transaction[];
}
interface FetchTransactionsFailureAction {
  type: typeof FETCH_TRANSACTIONS_FAILURE;
  payload: string;
}

// Add
// Тип для данных, передаваемых в action creator для создания транзакции
export type TransactionForCreation = Pick<Transaction, 'type' | 'amount' | 'category' | 'date' | 'comment'>;

interface AddTransactionRequestAction {
  type: typeof ADD_TRANSACTION_REQUEST;
  payload: Transaction; // Теперь payload будет содержать и userId
}
interface AddTransactionSuccessAction {
  type: typeof ADD_TRANSACTION_SUCCESS;
  payload: Transaction;
}
interface AddTransactionFailureAction {
  type: typeof ADD_TRANSACTION_FAILURE;
  payload: string;
}

// Edit
interface EditTransactionRequestAction {
  type: typeof EDIT_TRANSACTION_REQUEST;
  payload: Transaction; // Полный объект транзакции для обновления
}
interface EditTransactionSuccessAction {
  type: typeof EDIT_TRANSACTION_SUCCESS;
  payload: Transaction;
}
interface EditTransactionFailureAction {
  type: typeof EDIT_TRANSACTION_FAILURE;
  payload: string;
}

// Delete
interface DeleteTransactionRequestAction {
  type: typeof DELETE_TRANSACTION_REQUEST;
  payload: string; // ID транзакции для удаления
}
interface DeleteTransactionSuccessAction {
  type: typeof DELETE_TRANSACTION_SUCCESS;
  payload: string; // ID удаленной транзакции
}
interface DeleteTransactionFailureAction {
  type: typeof DELETE_TRANSACTION_FAILURE;
  payload: string;
}

// Общий тип для всех экшенов транзакций
export type TransactionActionTypes =
  | FetchTransactionsRequestAction
  | FetchTransactionsSuccessAction
  | FetchTransactionsFailureAction
  | AddTransactionRequestAction
  | AddTransactionSuccessAction
  | AddTransactionFailureAction
  | EditTransactionRequestAction
  | EditTransactionSuccessAction
  | EditTransactionFailureAction
  | DeleteTransactionRequestAction
  | DeleteTransactionSuccessAction
  | DeleteTransactionFailureAction;
