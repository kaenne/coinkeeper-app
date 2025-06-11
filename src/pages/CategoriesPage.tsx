import { useEffect, useState, useMemo } from 'react'; // Добавляем useMemo
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import {
  fetchCategories,
  addCategory,
  editCategory,
  deleteCategory,
  selectAllCategories,
  selectCategoriesLoading,
  selectCategoriesError,
} from '../store/categories/categoriesSlice';
import type { Category, CategoryForCreation } from '../store/categories/categories.types'; 
import Button from '../components/Button/Button';
import './CategoriesPage.css'; 

interface CategoryListItemProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryListItem = ({ category, onEdit, onDelete }: CategoryListItemProps) => { 
  return (
    <li className="category-list-item" style={{ backgroundColor: category.color ? `${category.color}20` : 'transparent' }}>
      <div className="category-item-details">
        {category.icon && <span className="category-item-icon" style={{ color: category.color }}>{category.icon}</span>}
        <span className="category-item-name" style={{ borderLeft: category.color ? `4px solid ${category.color}` : 'none', paddingLeft: category.color ? '8px' : '0' }}>
          {category.name}
        </span>
      </div>
      <div className="category-item-actions">
        <Button variant="secondary" onClick={() => onEdit(category)}>
          Редактировать
        </Button>
        <Button variant="danger" onClick={() => onDelete(category.id)}>
          Удалить
        </Button>
      </div>
    </li>
  );
};

interface CategoryFormProps {
  onSubmit: (data: CategoryForCreation) => void; 
  initialData?: Partial<Category>;
  buttonText: string;
}

const CategoryForm = ({ onSubmit, initialData = {}, buttonText }: CategoryFormProps) => { 
  const [name, setName] = useState(initialData.name || '');
  const [icon, setIcon] = useState(initialData.icon || '');
  const [color, setColor] = useState(initialData.color || '#cccccc');

  useEffect(() => {
    console.log('[CategoryForm Effect] Running. initialData:', initialData);
    setName(initialData.name || '');
    setIcon(initialData.icon || '');
    setColor(initialData.color || '#cccccc');
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault();
    if (!name.trim()) {
      alert('Название категории не может быть пустым.');
      return;
    }
    onSubmit({ name: name.trim(), icon: icon.trim(), color }); 
    if (!initialData.id) {
        console.log('[CategoryForm] Resetting form after adding new category.');
        setName('');
        setIcon('');
        setColor('#cccccc');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      <div className="category-form-inputs">
        <input
          type="text"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            console.log('[CategoryForm] Setting name:', e.target.value);
            setName(e.target.value);
          }} 
          placeholder="Название категории"
          required
        />
        <input
          type="text"
          value={icon}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            console.log('[CategoryForm] Setting icon:', e.target.value);
            setIcon(e.target.value);
          }} 
          placeholder="Иконка (Emoji)"
        />
        <input
          type="color"
          value={color}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            console.log('[CategoryForm] Setting color:', e.target.value);
            setColor(e.target.value);
          }} 
          title="Выберите цвет категории"
        />
      </div>
      <Button type="submit" variant="primary">
        {buttonText}
      </Button>
    </form>
  );
};


function CategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector(selectAllCategories);
  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const newCategoryInitialData = useMemo(() => ({ name: '', icon: '', color: '#cccccc' }), []);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddCategory = (data: CategoryForCreation) => { 
    dispatch(addCategory(data));
  };

  const handleEditCategory = (data: CategoryForCreation) => { 
    if (editingCategory) {
      dispatch(editCategory({ id: editingCategory.id, categoryData: data }));
      setEditingCategory(null); 
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию? Это также может повлиять на существующие транзакции.')) {
      dispatch(deleteCategory(id));
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
  };

  return (
    <div className="categories-page-container">
      <h1>Настройки категорий</h1>

      {editingCategory ? (
        <div>
          <h2>Редактировать категорию</h2>
          <CategoryForm
            onSubmit={handleEditCategory}
            initialData={editingCategory}
            buttonText="Сохранить изменения"
          />
          <Button variant="secondary" onClick={cancelEdit} style={{display: 'block', margin: '0 auto'}}>Отмена</Button>
        </div>
      ) : (
        <div>
          <h2>Добавить новую категорию</h2>
          <CategoryForm 
            onSubmit={handleAddCategory} 
            initialData={newCategoryInitialData} 
            buttonText="Добавить категорию" 
          />
        </div>
      )}

      {loading && <p className="loading-message">Загрузка категорий...</p>}
      {error && <p className="error-message">Ошибка: {error}</p>}

      {!loading && !error && categories.length === 0 && (
        <p className="no-categories-message">У вас пока нет категорий.</p>
      )}

      {categories.length > 0 && (
        <ul className="categories-list">
          {categories.map((category: Category) => ( 
            <CategoryListItem
              key={category.id}
              category={category}
              onEdit={startEdit}
              onDelete={handleDeleteCategory}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default CategoriesPage;
