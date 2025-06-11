import type { Transaction } from '../../store/transactions/transactions.types';
import type { Category } from '../../store/categories/categories.types'; 
import Button from '../Button/Button';
import './TransactionItem.css';

interface TransactionItemProps {
  transaction: Transaction;
  categories: Category[]; 
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TransactionItem = ({ transaction, categories, onEdit, onDelete }: TransactionItemProps) => {
  const { id, type, category: categoryName, amount, date, comment } = transaction; 
  const amountClass = type === 'income' ? 'amount-income' : 'amount-expense';

  const categoryDetails = categories.find(cat => cat.name === categoryName);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }; // Более короткий формат
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  return (
    <li className="transaction-item" style={{ borderLeftColor: categoryDetails?.color || 'transparent' }}>
      <div className="transaction-details">
        {categoryDetails?.icon && (
          <div className="category-icon-wrapper" style={{ color: categoryDetails?.color }}>
            {categoryDetails.icon}
          </div>
        )}
        <div className="transaction-info">
          <span className="transaction-category">
            {categoryName}
          </span>
          {comment && <span className="transaction-comment">{comment}</span>}
        </div>
        <span className="transaction-date">{formatDate(date)}</span>
        <span className={`transaction-amount ${amountClass}`}>
          {type === 'income' ? '+' : '-'}{amount.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₸
        </span>
      </div>
      <div className="transaction-actions">
        <Button variant="secondary" onClick={() => onEdit(id)} className="btn-edit">
          Изм.
        </Button>
        <Button variant="danger" onClick={() => onDelete(id)} className="btn-delete">
          Удал.
        </Button>
      </div>
    </li>
  );
};

export default TransactionItem;
