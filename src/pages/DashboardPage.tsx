// src/pages/DashboardPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchTransactions, addTransaction, editTransaction, deleteTransaction } from '../store/transactions/transactions.actions';
import { fetchCategories, selectAllCategories } from '../store/categories/categoriesSlice'; 
import type { Transaction, TransactionForCreation } from '../store/transactions/transactions.types';
import TransactionItem from '../components/TransactionItem/TransactionItem';
import TransactionFormModal from '../components/TransactionFormModal/TransactionFormModal';
import Button from '../components/Button/Button';
import './DashboardPage.css'; 

function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: transactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useSelector((state: RootState) => state.transactions);

  const categories = useSelector(selectAllCategories); 
  const categoriesLoading = useSelector((state: RootState) => state.categories.loading); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchCategories()); 
  }, [dispatch]);

  const handleOpenModal = (transaction?: Transaction) => {
    setTransactionToEdit(transaction || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTransactionToEdit(null);
  };

  const handleSubmitTransaction = (data: Partial<Transaction> | TransactionForCreation) => {
    if ('id' in data && data.id) { 
      dispatch(editTransaction(data.id, data as Partial<Transaction>));
    } else { 
      dispatch(addTransaction(data as TransactionForCreation));
    }
    handleCloseModal();
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      dispatch(deleteTransaction(id));
    }
  };

  const currentBalance = useMemo(() => {
    return transactions.reduce((acc: number, transaction: Transaction) => { 
      return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
    }, 0);
  }, [transactions]);

  const totalIncomeForPeriod = useMemo(() => { 
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpensesForPeriod = useMemo(() => { 
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  return (
    <div className="dashboard-container"> 
      <div className="dashboard-header">
        <h1>Мой Кошелек</h1>
        <Button variant="primary" onClick={() => handleOpenModal()} className="add-transaction-button">
          Добавить транзакцию
        </Button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-header">
            <div className="card-icon wallet-icon">💰</div> 
            <span className="card-title">Текущий баланс</span>
          </div>
          <div className="card-content">
            <span className={`card-value ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
              {currentBalance.toLocaleString('ru-RU', { style: 'currency', currency: 'KZT' })}
            </span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-header">
            <div className="card-icon income-icon">📈</div> 
            <span className="card-title">Общий доход (за все время)</span>
          </div>
          <div className="card-content">
            <span className="card-value positive">
              {totalIncomeForPeriod.toLocaleString('ru-RU', { style: 'currency', currency: 'KZT' })}
            </span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-header">
            <div className="card-icon expense-icon">📉</div> 
            <span className="card-title">Общий расход (за все время)</span>
          </div>
          <div className="card-content">
            <span className="card-value negative">
              {totalExpensesForPeriod.toLocaleString('ru-RU', { style: 'currency', currency: 'KZT' })}
            </span>
          </div>
        </div>
      </div>
      
      {transactionsLoading && <p className="loading-message">Загрузка транзакций...</p>}
      {categoriesLoading && transactionsLoading && <p className="loading-message">Загрузка данных...</p>}
      {transactionsError && <p className="error-message">Ошибка загрузки транзакций: {transactionsError}</p>}

      <div className="last-transactions-section">
        <div className="last-transactions-header">
          <h2>Последние транзакции</h2>
        </div>
        {sortedTransactions.length > 0 ? (
          <ul className="transactions-list">
            {sortedTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                categories={categories} 
                onEdit={() => handleOpenModal(transaction)}
                onDelete={handleDeleteTransaction}
              />
            ))}
          </ul>
        ) : (
          !transactionsLoading && <p>У вас пока нет транзакций.</p>
        )}
      </div>

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTransaction}
        transactionToEdit={transactionToEdit}
        categories={categories} 
      />
    </div>
  );
}

export default DashboardPage;
