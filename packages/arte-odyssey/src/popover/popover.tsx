'use client';

import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  flip,
  offset,
  type Placement,
  useFloating,
} from '@floating-ui/react';
import { AnimatePresence, type Variants } from 'motion/react';
import * as motion from 'motion/react-client';
import {
  type FC,
  type HTMLProps,
  type PropsWithChildren,
  type ReactElement,
  useCallback,
  useEffect,
  useId,
  useState,
} from 'react';
import { usePortalRoot } from './../providers';
import { PopoverProvider, usePopoverContent, usePopoverTrigger } from './hooks';

export { useOpenContext } from './hooks';

const Root: FC<
  PropsWithChildren<{
    placement?: Placement;
    type?: 'dialog' | 'menu' | 'tooltip' | 'listbox';
    flipDisabled?: boolean;
  }>
> = ({
  children,
  type = 'menu',
  placement = 'bottom-start',
  flipDisabled = false,
}) => {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);

  const {
    refs,
    floatingStyles,
    context,
    placement: computedPlacement,
  } = useFloating({
    strategy: 'fixed',
    placement,
    open: isOpen,
    whileElementsMounted: autoUpdate,
    // 要素と8pxだけ離す
    middleware: [
      offset(8),
      !flipDisabled &&
        flip({
          fallbackAxisSideDirection: 'end',
          padding: 8,
        }),
    ],
    transform: false,
  });

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <PopoverProvider
      value={{
        rootId: id,
        type,
        isOpen,
        toggleOpen,
        onOpen,
        onClose,
        context,
        placement: computedPlacement,
        triggerRef: refs.domReference,
        setTriggerRef: refs.setReference,
        setContentRef: refs.setFloating,
        contentStyles: floatingStyles,
      }}
    >
      {children}
    </PopoverProvider>
  );
};

const contentMotionVariants = {
  closed: {
    scale: 0,
    transition: {
      delay: 0.1,
    },
  },
  open: {
    scale: 1,
    transition: {
      type: 'spring',
      duration: 0.2,
    },
  },
} satisfies Variants;

const Content: FC<{
  renderItem: (props: Record<string, unknown>) => ReactElement;
  motionVariants?: Variants;
}> = ({ renderItem, motionVariants = contentMotionVariants }) => {
  const { isOpen, isHover, context, setContentRef, contentStyles, itemProps } =
    usePopoverContent();

  const root = usePortalRoot();
  const protalProps = root ? { root } : {};

  return (
    <AnimatePresence>
      {isOpen && (
        <FloatingPortal {...protalProps}>
          <FloatingFocusManager
            context={context}
            disabled={isHover}
            modal={false}
          >
            <div ref={setContentRef} style={contentStyles}>
              <motion.div
                animate="open"
                exit="closed"
                initial="closed"
                variants={motionVariants}
              >
                {renderItem(itemProps)}
              </motion.div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </AnimatePresence>
  );
};

const Trigger: FC<{
  renderItem: (
    props: Omit<HTMLProps<HTMLButtonElement>, 'selected' | 'active' | 'color'>,
  ) => ReactElement;
}> = ({ renderItem }) => {
  const props = usePopoverTrigger();

  return renderItem(props);
};

export const Popover = {
  Root,
  Content,
  Trigger,
};
