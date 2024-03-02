import { RECOIL_KEYS } from '@/constants';
import { atom, useRecoilState } from 'recoil';

const key = RECOIL_KEYS.SQL_STATEMENT_COLUMNS_FORM_TYPE;

const columnsType = atom<'table' | 'form'>({
  key: RECOIL_KEYS.SQL_STATEMENT_COLUMNS_FORM_TYPE,
  default: 'form',
  effects: [
    ({ setSelf, onSet }) => {
      const savedValue = localStorage.getItem(key);
      const parsedValue = savedValue ? JSON.parse(savedValue) : null;
      if (parsedValue === 'table' || parsedValue === 'form') {
        setSelf(parsedValue);
      }

      onSet((newValue, _, isReset) => {
        isReset
          ? localStorage.removeItem(key)
          : localStorage.setItem(key, JSON.stringify(newValue));
      });
    },
  ],
});

export const useColumnsType = () => useRecoilState(columnsType);
