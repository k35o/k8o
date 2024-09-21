'use client';

import { useClickAway } from '@/hooks/click-away';
import {
  FloatingContext,
  Placement,
  ReferenceType,
} from '@floating-ui/react';
import {
  createContext,
  CSSProperties,
  KeyboardEvent,
  MutableRefObject,
  useContext,
  useMemo,
} from 'react';

type PopoverContext = {
  rootId: string;
  type: 'menu' | 'tooltip';
  isOpen: boolean;
  toggleOpen: () => void;
  onOpen: () => void;
  onClose: () => void;

  context: FloatingContext;
  placement: Placement;
  triggerRef: MutableRefObject<Element | null>;
  setTriggerRef: (node: ReferenceType | null) => void;
  setContentRef: (node: HTMLElement | null) => void;
  contentStyles: CSSProperties;
};

const PopoverContext = createContext<PopoverContext | null>(null);

export const PopoverProvider = PopoverContext.Provider;

const usePopoverContext = (): PopoverContext => {
  const popover = useContext(PopoverContext);
  if (!popover) {
    throw new Error(
      'usePopoverContext must be used within a Popover.Root',
    );
  }

  return popover;
};

export const useFloatingUIContext = () => {
  const popover = usePopoverContext();
  return useMemo(() => popover.context, [popover]);
};

export const usePlacement = (): Placement => {
  const popover = usePopoverContext();
  return popover.placement;
};

export const useOpenContext = () => {
  const popover = usePopoverContext();
  return useMemo(
    () => ({
      isOpen: popover.isOpen,
      onOpen: popover.onOpen,
      onClose: popover.onClose,
      toggleOpen: popover.toggleOpen,
    }),
    [
      popover.isOpen,
      popover.onClose,
      popover.onOpen,
      popover.toggleOpen,
    ],
  );
};

export const usePopoverContent = () => {
  const popover = usePopoverContext();
  const isHover = popover.type === 'tooltip';
  const ref = useClickAway<HTMLDivElement>((event) => {
    if (!open) {
      return;
    }
    if (
      popover.triggerRef.current?.contains(
        event.target as HTMLElement,
      )
    ) {
      return;
    }
    popover.onClose();
  }, !isHover);

  const itemProps = useMemo(() => {
    switch (popover.type) {
      case 'menu':
        return {
          id: `${popover.rootId}_list`,
          ref,
          role: 'menu',
          'aria-orientation': 'vertical',
          tabIndex: -1,
        };
      case 'tooltip':
        return {
          id: `${popover.rootId}_list`,
          ref,
          role: 'tooltip',
          tabIndex: -1,
        };
    }
  }, [popover.rootId, popover.type, ref]);

  return useMemo(
    () => ({
      id: `${popover.rootId}_list`,
      ref: ref,
      isOpen: popover.isOpen,
      isHover,
      context: popover.context,
      setContentRef: popover.setContentRef,
      contentStyles: popover.contentStyles,
      itemProps,
    }),
    [
      popover.rootId,
      popover.isOpen,
      popover.context,
      popover.setContentRef,
      popover.contentStyles,
      ref,
      isHover,
      itemProps,
    ],
  );
};

export const usePopoverTrigger = () => {
  const popover = usePopoverContext();
  return useMemo(() => {
    switch (popover.type) {
      case 'tooltip':
        return {
          actionProps: {
            onMouseEnter: popover.onOpen,
            onMouseLeave: popover.onClose,
            onFocus: popover.onOpen,
            onBlur: popover.onClose,
          },
          restProps: {
            'aria-describedby': `${popover.rootId}_content`,
            ref: popover.setTriggerRef,
          },
        };
      case 'menu':
        return {
          actionProps: {
            onClick: popover.toggleOpen,
            onKeyDown: (e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                popover.toggleOpen();
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                popover.onOpen();
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                popover.onOpen();
              }
            },
          },
          restProps: {
            'aria-haspopup': 'menu',
            'aria-expanded': popover.isOpen,
            'aria-controls': `${popover.rootId}_list`,
            ref: popover.setTriggerRef,
          },
        };
    }
  }, [popover]);
};
