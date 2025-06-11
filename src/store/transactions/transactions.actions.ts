// src/store/transactions/transactions.actions.ts
import type { AppDispatch, RootState } from '../index'; 
import type { Transaction, TransactionForCreation } from './transactions.types'; 
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
import * as transactionService from '../../services/transactionService';

export const fetchTransactions = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch({ type: FETCH_TRANSACTIONS_REQUEST });
  try {
    const userId = getState().auth.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const transactions = await transactionService.getAllTransactions(userId);
    dispatch({ type: FETCH_TRANSACTIONS_SUCCESS, payload: transactions });
  } catch (error: any) {
    dispatch({ type: FETCH_TRANSACTIONS_FAILURE, payload: error.message || 'Failed to fetch transactions' });
  }
};

export const addTransaction = (transactionDetails: TransactionForCreation) => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    const userId = getState().auth.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    const transactionDataWithUser: transactionService.NewTransactionData = {
      ...transactionDetails,
      userId,
    };
    // Диспатчим REQUEST с полными данными, включая userId, чтобы редьюсер мог их использовать, если нужно
    dispatch({ type: ADD_TRANSACTION_REQUEST, payload: transactionDataWithUser as Transaction }); // Приведение типа, т.к. id еще нет
    const newTransaction = await transactionService.addTransaction(transactionDataWithUser);
    dispatch({ type: ADD_TRANSACTION_SUCCESS, payload: newTransaction });
  } catch (error: any) {
    dispatch({ type: ADD_TRANSACTION_FAILURE, payload: error.message || 'Failed to add transaction' });
  }
};

export const editTransaction = (transactionId: string, transactionData: Partial<Transaction>) => async (dispatch: AppDispatch) => {
  dispatch({ type: EDIT_TRANSACTION_REQUEST, payload: { transactionId, transactionData } });
  try {
    const updatedTransaction = await transactionService.updateTransaction(transactionId, transactionData);
    dispatch({ type: EDIT_TRANSACTION_SUCCESS, payload: updatedTransaction });
  } catch (error: any) {
    dispatch({ type: EDIT_TRANSACTION_FAILURE, payload: error.message || 'Failed to edit transaction' });
  }
};

export const deleteTransaction = (transactionId: string) => async (dispatch: AppDispatch) => {
  dispatch({ type: DELETE_TRANSACTION_REQUEST, payload: transactionId });
  try {
    await transactionService.deleteTransaction(transactionId);
    dispatch({ type: DELETE_TRANSACTION_SUCCESS, payload: transactionId });
  } catch (error: any) {
    dispatch({ type: DELETE_TRANSACTION_FAILURE, payload: error.message || 'Failed to delete transaction' });
  }
};
