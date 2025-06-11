// Вспомогательные функции для дат

export const getMonthYear = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const getStartOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

export const getEndOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0, 23, 59, 59, 999); // Конец дня последнего числа месяца
};

export const formatDateForAxis = (dateString: string): string => {
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;
};
