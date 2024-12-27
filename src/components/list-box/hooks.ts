'use client';

import {
  createContext,
  HTMLProps,
  RefObject,
  use,
  useMemo,
} from 'react';
import { useOpenContext } from '../popover/hooks';
import { useListItem } from '@floating-ui/react';

export type Option = {
  key: string;
  label: string;
};

type MenuContext = {
  options: Option[];
  activeIndex: number | null;
  selectedIndex: number | null;
  handleSelect: (index: number) => void;
  itemElementsRef: RefObject<(HTMLElement | null)[]>;
  getTriggerProps: (
    userProps?: HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
  getContentProps: (
    userProps?: HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
  getItemProps: (
    userProps?: Omit<HTMLProps<HTMLElement>, 'selected' | 'active'>,
  ) => Record<string, unknown>;
};

const MenuContext = createContext<MenuContext | null>(null);

export const MenuContextProvider = MenuContext;

const useMenuContext = (): MenuContext => {
  const menu = use(MenuContext);
  if (!menu) {
    throw new Error(
      'useMenuContext must be used within a DropdownMenu.Root',
    );
  }

  return menu;
};

export const useMenuContent = () => {
  const menu = useMenuContext();

  return useMemo(
    () => ({
      options: menu.options,
      selectedIndex: menu.selectedIndex,
      contentProps: menu.getContentProps(),
      itemElementsRef: menu.itemElementsRef,
    }),
    [menu],
  );
};

export const useMenuItem = (index: number) => {
  const menu = useMenuContext();
  const { onClose } = useOpenContext();
  const item = useListItem();
  return useMemo(
    () => ({
      selected: menu.selectedIndex === index,
      props: {
        ref: item.ref,
        'aria-selected': menu.selectedIndex === index,
        role: 'option',
        tabIndex: menu.activeIndex === item.index ? 0 : -1,
        ...menu.getItemProps({
          onClick: () => {
            menu.handleSelect(index);
            onClose();
          },
        }),
      },
    }),
    [index, item.index, item.ref, menu, onClose],
  );
};

export const useMenuTrigger = () => {
  const menu = useMenuContext();
  const defaultLabel = '選択してください';
  const label =
    menu.selectedIndex !== null
      ? (menu.options[menu.selectedIndex]?.label ?? defaultLabel)
      : defaultLabel;
  return useMemo(
    () => ({
      label,
      getTriggerProps: menu.getTriggerProps,
    }),
    [label, menu.getTriggerProps],
  );
};
