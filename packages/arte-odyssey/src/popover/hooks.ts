'use client';

import type {
  FloatingContext,
  Placement,
  ReferenceType,
} from '@floating-ui/react';
import { useClickAway } from '@k8o/hooks/click-away';
import {
  type CSSProperties,
  createContext,
  type HTMLProps,
  type KeyboardEvent,
  type RefObject,
  use,
  useMemo,
} from 'react';

type PopoverContext = {
  rootId: string;
  type: 'dialog' | 'menu' | 'tooltip' | 'listbox';
  isOpen: boolean;
  toggleOpen: () => void;
  onOpen: () => void;
  onClose: () => void;

  context: FloatingContext;
  placement: Placement;
  triggerRef: RefObject<Element | null>;
  setTriggerRef: (node: ReferenceType | null) => void;
  setContentRef: (node: HTMLElement | null) => void;
  contentStyles: CSSProperties;
};

const PopoverContext = createContext<PopoverContext | null>(null);

export const PopoverProvider = PopoverContext;

const usePopoverContext = (): PopoverContext => {
  const popover = use(PopoverContext);
  if (!popover) {
    throw new Error('usePopoverContext must be used within a Popover.Root');
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
    [popover.isOpen, popover.onClose, popover.onOpen, popover.toggleOpen],
  );
};

export const usePopoverContent = () => {
  const popover = usePopoverContext();
  const isHover = popover.type === 'tooltip';
  const ref = useClickAway<HTMLDivElement>((event) => {
    if (!popover.isOpen) {
      return;
    }
    if (popover.triggerRef.current?.contains(event.target as HTMLElement)) {
      return;
    }
    popover.onClose();
  }, !isHover);

  const itemProps = useMemo(() => {
    switch (popover.type) {
      case 'dialog':
        return {
          id: `${popover.rootId}_list`,
          ref,
          role: 'dialog',
        };
      case 'menu':
        return {
          id: `${popover.rootId}_list`,
          ref,
          role: 'menu',
          'aria-orientation': 'vertical',
        };
      case 'tooltip':
        return {
          id: `${popover.rootId}_list`,
          ref,
          role: 'tooltip',
          onMouseEnter: popover.onOpen,
          onMouseLeave: popover.onClose,
          onFocus: popover.onOpen,
          onBlur: popover.onClose,
        };
      case 'listbox':
        return {
          id: `${popover.rootId}_list`,
          ref,
          role: 'listbox',
        };
    }
  }, [popover.rootId, popover.type, ref, popover.onClose, popover.onOpen]);

  return useMemo(
    () => ({
      id: `${popover.rootId}_list`,
      ref,
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

export const usePopoverTrigger = (): Omit<
  HTMLProps<HTMLButtonElement>,
  'selected' | 'active'
> => {
  const popover = usePopoverContext();
  return useMemo(() => {
    switch (popover.type) {
      case 'dialog':
        return {
          onClick: popover.toggleOpen,
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              popover.toggleOpen();
            }
          },
          'aria-haspopup': 'dialog',
          'aria-expanded': popover.isOpen,
          'aria-controls': popover.isOpen
            ? `${popover.rootId}_list`
            : undefined,
          ref: popover.setTriggerRef,
        };
      case 'tooltip':
        return {
          onMouseEnter: popover.onOpen,
          onMouseLeave: popover.onClose,
          onFocus: popover.onOpen,
          onBlur: popover.onClose,
          'aria-describedby': `${popover.rootId}_content`,
          ref: popover.setTriggerRef,
        };
      case 'menu':
        return {
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
          'aria-haspopup': 'menu',
          'aria-expanded': popover.isOpen,
          'aria-controls': popover.isOpen
            ? `${popover.rootId}_list`
            : undefined,
          ref: popover.setTriggerRef,
        };
      case 'listbox':
        return {
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
          role: 'combobox',
          'aria-haspopup': 'listbox',
          'aria-expanded': popover.isOpen,
          'aria-controls': popover.isOpen
            ? `${popover.rootId}_list`
            : undefined,
          ref: popover.setTriggerRef,
        };
    }
  }, [popover]);
};
