'use client';

import { useClickAway } from '@/hooks/click-away';
import { FloatingContext, ReferenceType } from '@floating-ui/react';
import {
  createContext,
  CSSProperties,
  HTMLProps,
  MouseEventHandler,
  MutableRefObject,
  useContext,
  useMemo,
} from 'react';

type MenuContext = {
  rootId: string;
  activeIndex: number | null;
  isOpen: boolean;
  toggleOpen: () => void;
  onOpen: () => void;
  onClose: () => void;

  context: FloatingContext;
  triggerRef: MutableRefObject<Element | null>;
  setTriggerRef: (node: ReferenceType | null) => void;
  setContentRef: (node: HTMLElement | null) => void;
  contentStyles: CSSProperties;
  itemElementsRef: MutableRefObject<(HTMLElement | null)[]>;
  getTriggerProps: (
    userProps?: HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
  getContentProps: (
    userProps?: HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
  getItemProps: (
    userProps?: Omit<
      React.HTMLProps<HTMLElement>,
      'selected' | 'active'
    >,
  ) => Record<string, unknown>;
};

const MenuContext = createContext<MenuContext | null>(null);

export const MenuContextProvider = MenuContext.Provider;

const useMenuContext = (): MenuContext => {
  const menu = useContext(MenuContext);
  if (!menu) {
    throw new Error(
      'useMenuContext must be used within a DropdownMenu.Root',
    );
  }

  return menu;
};

export const useMenuContent = () => {
  const menu = useMenuContext();
  const ref = useClickAway<HTMLDivElement>((event) => {
    if (!open) {
      return;
    }
    if (
      menu.triggerRef.current?.contains(event.target as HTMLElement)
    ) {
      return;
    }
    menu.onClose();
  });
  return useMemo(
    () => ({
      id: `${menu.rootId}_list`,
      ref: ref,
      isOpen: menu.isOpen,
      context: menu.context,
      setContentRef: menu.setContentRef,
      contentStyles: menu.contentStyles,
      contentProps: menu.getContentProps(),
      itemElementsRef: menu.itemElementsRef,
    }),
    [ref, menu],
  );
};

export const useMenuItem = ({
  onClick,
}: {
  onClick: MouseEventHandler;
}) => {
  const menu = useMenuContext();
  return useMemo(
    () => ({
      activeIndex: menu.activeIndex,
      props: menu.getItemProps({
        onClick: (e) => {
          onClick(e);
          menu.onClose();
        },
      }),
    }),
    [menu, onClick],
  );
};

export const useMenuTrigger = () => {
  const menu = useMenuContext();
  return useMemo(
    () => ({
      contentId: `${menu.rootId}_list`,
      isOpen: menu.isOpen,
      setRef: menu.setTriggerRef,
      props: menu.getTriggerProps({
        onClick: menu.toggleOpen,
        onKeyDown: (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            menu.toggleOpen();
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            menu.onOpen();
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            menu.onOpen();
          }
        },
      }),
    }),
    [menu],
  );
};
