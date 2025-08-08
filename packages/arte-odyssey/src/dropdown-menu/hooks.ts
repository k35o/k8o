'use client';

import { useListItem } from '@floating-ui/react';
import {
  createContext,
  type HTMLProps,
  type MouseEventHandler,
  type RefObject,
  use,
  useMemo,
} from 'react';
import { useOpenContext } from '../popover/hooks';

type MenuContext = {
  activeIndex: number | null;
  itemElementsRef: RefObject<(HTMLElement | null)[]>;
  getTriggerProps: (
    userProps?: HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
  getContentProps: (
    userProps?: HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
  getItemProps: (
    userProps?: Omit<HTMLProps<HTMLButtonElement>, 'selected' | 'active'>,
  ) => Record<string, unknown>;
};

const MenuContext = createContext<MenuContext | null>(null);

export const MenuContextProvider = MenuContext;

const useMenuContext = (): MenuContext => {
  const menu = use(MenuContext);
  if (!menu) {
    throw new Error('useMenuContext must be used within a DropdownMenu.Root');
  }

  return menu;
};

export const useMenuContent = () => {
  const menu = useMenuContext();

  return useMemo(
    () => ({
      contentProps: menu.getContentProps(),
      itemElementsRef: menu.itemElementsRef,
    }),
    [menu],
  );
};

export const useMenuItem = ({ onClick }: { onClick: MouseEventHandler }) => {
  const menu = useMenuContext();
  const { onClose } = useOpenContext();
  const item = useListItem();
  return useMemo(
    () => ({
      ref: item.ref,
      role: 'menuitem',
      tabIndex: menu.activeIndex === item.index ? 0 : -1,
      ...menu.getItemProps({
        onClick: (e) => {
          onClick(e);
          onClose();
        },
      }),
    }),
    [item.index, item.ref, menu, onClick, onClose],
  );
};

export const useMenuTrigger = () => {
  const menu = useMenuContext();
  return useMemo(() => menu.getTriggerProps, [menu]);
};
