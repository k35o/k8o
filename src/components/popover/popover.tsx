'use client';

import {
  FC,
  HTMLProps,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useId,
  useState,
} from 'react';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  Placement,
  useFloating,
} from '@floating-ui/react';
import {
  PopoverProvider,
  usePopoverContent,
  usePopoverTrigger,
} from './hooks';
import { AnimatePresence, motion, Variants } from 'framer-motion';

const Root: FC<PropsWithChildren<{ placement?: Placement }>> = ({
  children,
  placement = 'bottom-start',
}) => {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    strategy: 'fixed',
    placement: placement,
    open: isOpen,
    whileElementsMounted: autoUpdate,
    // 要素と8pxだけ離す
    middleware: [
      offset(8),
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
        isOpen,
        toggleOpen,
        onOpen,
        onClose,
        context,
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
      delay: 0.15,
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
}> = ({ renderItem }) => {
  const { id, ref, isOpen, context, setContentRef, contentStyles } =
    usePopoverContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div ref={setContentRef} style={contentStyles}>
              <motion.div
                animate={isOpen ? 'open' : 'closed'}
                initial="closed"
                exit="closed"
                variants={contentMotionVariants}
              >
                {renderItem({
                  id,
                  ref,
                  role: 'menu',
                  'aria-orientation': 'vertical',
                  tabIndex: -1,
                })}
              </motion.div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </AnimatePresence>
  );
};

const Trigger: FC<{
  renderItem: (props: {
    actionProps: Omit<HTMLProps<HTMLElement>, 'selected' | 'active'>;
    restProps: Record<string, unknown>;
  }) => ReactElement;
}> = ({ renderItem }) => {
  const props = usePopoverTrigger();

  return renderItem(props);
};

export const Popover = {
  Root,
  Content,
  Trigger,
};
