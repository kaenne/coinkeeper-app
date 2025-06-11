import { useState, useEffect, useRef } from 'react'; // Добавим useRef
import { useDispatch } from 'react-redux'; 
import type { AppDispatch } from '../../store'; 
import { addCategory } from '../../store/categories/categoriesSlice'; 
import type { Transaction } from '../../store/transactions/transactions.types';
import type { TransactionForCreation } from '../../store/transactions/transactions.types'; 
import type { Category } from '../../store/categories/categories.types'; 
import Button from '../Button/Button';
import './TransactionFormModal.css';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transactionData: Partial<Transaction> | TransactionForCreation) => void; 
  transactionToEdit?: Transaction | null;
  categories: Category[]; 
}

const TransactionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  transactionToEdit,
  categories, 
}: TransactionFormModalProps) => {
  const dispatch = useDispatch<AppDispatch>(); 
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<number | ''>(''); 
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); 
  const [date, setDate] = useState('');
  const [comment, setComment] = useState('');

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Для отладки
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
    console.log(`[TransactionFormModal] Render count: ${renderCount.current}`);
  });


  // Effect 1: Reset the "new category" input UI when the modal opens or the editing target changes.
  useEffect(() => {
    // Этот console.log поможет отследить, когда именно срабатывает этот эффект
    console.log('[TransactionFormModal Effect 1] Running. isOpen:', isOpen, 'transactionToEdit:', transactionToEdit);
    if (isOpen) {
      console.log('[TransactionFormModal Effect 1] Resetting new category UI.');
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    }
  }, [isOpen, transactionToEdit]);


  // Effect 2: Handles initialization of general form fields and selectedCategoryId.
  useEffect(() => {
    console.log('[TransactionFormModal Effect 2] Running. isOpen:', isOpen, 'transactionToEdit:', transactionToEdit, 'categories count:', categories.length, 'selectedCategoryId:', selectedCategoryId);
    if (isOpen) {
      if (transactionToEdit) {
        setType(transactionToEdit.type);
        setAmount(transactionToEdit.amount);
        setDate(transactionToEdit.date.split('T')[0]);
        setComment(transactionToEdit.comment || '');
        const categoryToSelect = categories.find(cat => cat.name === transactionToEdit.category);
        const targetId = categoryToSelect ? categoryToSelect.id : '';
        if (selectedCategoryId !== targetId) {
          console.log('[TransactionFormModal Effect 2 - Edit] Setting selectedCategoryId to:', targetId);
          setSelectedCategoryId(targetId);
        }
      } else { // New transaction
        setType('expense');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setComment('');
        
        // Only adjust selectedCategoryId if not in the process of adding a new one
        if (!showNewCategoryInput) {
          const currentCategoryIsValid = categories.some(cat => cat.id === selectedCategoryId);
          if (!currentCategoryIsValid) {
            const newSelectedId = categories.length > 0 ? categories[0].id : '';
            if (selectedCategoryId !== newSelectedId) {
                console.log('[TransactionFormModal Effect 2 - New/Default] Setting selectedCategoryId to:', newSelectedId);
                setSelectedCategoryId(newSelectedId);
            }
          }
        }
      }
    }
  }, [isOpen, transactionToEdit, categories, selectedCategoryId, showNewCategoryInput]); // Добавили showNewCategoryInput

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Название новой категории не может быть пустым.');
      return;
    }
    try {
      const resultAction = await dispatch(addCategory({ name: newCategoryName.trim() }));
      if (addCategory.fulfilled.match(resultAction)) {
        const newCat = resultAction.payload;
        setSelectedCategoryId(newCat.id); 
        setShowNewCategoryInput(false);
        setNewCategoryName('');
      } else {
        alert(`Не удалось добавить категорию: ${resultAction.payload || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      alert('Произошла ошибка при добавлении категории.');
      console.error("Failed to add category:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { // Типизирован 'e'
    e.preventDefault();
    if (amount === '' || Number(amount) <= 0) {
      alert('Сумма должна быть положительным числом.');
      return;
    }
    if (!selectedCategoryId && !showNewCategoryInput) { 
        alert('Пожалуйста, выберите категорию.');
        return;
    }
    if (!date) {
        alert('Дата не может быть пустой.');
        return;
    }

    const categoryName = categories.find(cat => cat.id === selectedCategoryId)?.name || '';

    const transactionDetails: TransactionForCreation = {
      type,
      amount: Number(amount),
      category: categoryName, 
      date,
      comment,
    };

    if (transactionToEdit) {
      onSubmit({ ...transactionDetails, id: transactionToEdit.id });
    } else {
      onSubmit(transactionDetails);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{transactionToEdit ? 'Редактировать транзакцию' : 'Добавить транзакцию'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="type">Тип:</label>
            <select id="type" value={type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value as 'income' | 'expense')}> {/* Типизирован 'e' */}
              <option value="income">Доход</option>
              <option value="expense">Расход</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="amount">Сумма:</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Категория:</label>
            {!showNewCategoryInput ? (
              <>
                <select
                  id="category"
                  value={selectedCategoryId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    console.log('[TransactionFormModal] Category selected:', e.target.value);
                    setSelectedCategoryId(e.target.value);
                  }} // Типизирован 'e'
                  required={!showNewCategoryInput} 
                  disabled={categories.length === 0 && !showNewCategoryInput}
                >
                  <option value="" disabled={categories.length > 0} style={{ fontStyle: 'italic' }}>
                    {categories.length === 0 ? "Нет категорий, создайте новую" : "Выберите категорию"}
                  </option>
                  {categories.map(cat => (
                    <option 
                      key={cat.id} 
                      value={cat.id} 
                    >
                      {cat.icon && `${cat.icon} `}{cat.name}
                    </option>
                  ))}
                </select>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    console.log('[TransactionFormModal] "Создать новую" clicked.');
                    setShowNewCategoryInput(true);
                  }} 
                  style={{ marginTop: '5px', fontSize: '0.9em', padding: '5px 10px' }}
                >
                  Создать новую
                </Button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    console.log('[TransactionFormModal] Typing new category name:', e.target.value);
                    setNewCategoryName(e.target.value);
                  }} // Типизирован 'e'
                  placeholder="Название новой категории"
                  style={{ flexGrow: 1 }}
                />
                <Button type="button" variant="primary" onClick={handleAddNewCategory} style={{ fontSize: '0.9em', padding: '8px 10px' }}>
                  Сохранить
                </Button>
                <Button type="button" variant="secondary" onClick={() => {
                  console.log('[TransactionFormModal] "Отмена" new category clicked.');
                  setShowNewCategoryInput(false);
                  setNewCategoryName(''); // Также очистим имя при отмене
                }} style={{ fontSize: '0.9em', padding: '8px 10px' }}>
                  Отмена
                </Button>
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="date">Дата:</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} // Типизирован 'e'
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="comment">Комментарий (необязательно):</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)} // Типизирован 'e'
              placeholder="Например, купил молоко"
            />
          </div>
          <div className="form-actions">
            <Button type="submit" variant="primary">
              {transactionToEdit ? 'Сохранить' : 'Добавить'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionFormModal;
