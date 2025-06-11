// src/store/transactions/transactions.reducer.ts
import type { TransactionsState, TransactionActionTypes } from './transactions.types';
import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_TRANSACTIONS_SUCCESS,
  FETCH_TRANSACTIONS_FAILURE,
  ADD_TRANSACTION_REQUEST,
  ADD_TRANSACTION_SUCCESS,
  ADD_TRANSACTION_FAILURE,
  EDIT_TRANSACTION_REQUEST,
  EDIT_TRANSACTION_SUCCESS,
  EDIT_TRANSACTION_FAILURE,
  DELETE_TRANSACTION_REQUEST,
  DELETE_TRANSACTION_SUCCESS,
  DELETE_TRANSACTION_FAILURE,
} from './transactions.types';

const initialState: TransactionsState = {
  items: [],
  loading: false,
  error: null,
};

export const transactionsReducer = (
  state = initialState,
  action: TransactionActionTypes
): TransactionsState => {
  switch (action.type) {
    case FETCH_TRANSACTIONS_REQUEST:
    case ADD_TRANSACTION_REQUEST:
    case EDIT_TRANSACTION_REQUEST:
    case DELETE_TRANSACTION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        items: action.payload,
        loading: false,
      };

    case ADD_TRANSACTION_SUCCESS:
      return {
        ...state,
        items: [...state.items, action.payload],
        loading: false,
      };

    case EDIT_TRANSACTION_SUCCESS:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
        loading: false,
      };

    case DELETE_TRANSACTION_SUCCESS:
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        loading: false,
      };

    case FETCH_TRANSACTIONS_FAILURE:
    case ADD_TRANSACTION_FAILURE:
    case EDIT_TRANSACTION_FAILURE:
    case DELETE_TRANSACTION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
