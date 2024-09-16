import { useCallback, useState } from 'react';

const key = 'sqlStatement.columns.form.type';

export const useColumnsType = () => {
  const [columnsType, setColumnsType] = useState<'table' | 'form'>(
    () => {
      const savedValue = localStorage.getItem(key);
      const parsedValue = savedValue ? JSON.parse(savedValue) : null;
      if (parsedValue === 'table' || parsedValue === 'form') {
        return parsedValue;
      }
      return 'form';
    },
  );

  const changeColumnsType = useCallback((type: 'table' | 'form') => {
    setColumnsType(type);
    localStorage.setItem(key, JSON.stringify(type));
  }, []);

  return [columnsType, changeColumnsType] as const;
};
