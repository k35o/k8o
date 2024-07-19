import { RECOIL_KEYS } from '@/constants';
import { atom } from 'recoil';

export const openState = atom<boolean>({
  key: RECOIL_KEYS.ACCORIDON_OPEN,
  default: false,
});

export const itemIdState = atom<string>({
  key: RECOIL_KEYS.ACCORIDON_ITEM_ID,
  default: '',
});
