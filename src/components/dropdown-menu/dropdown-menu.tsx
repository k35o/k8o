'use client';

import {
  createContext,
  CSSProperties,
  FC,
  MutableRefObject,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  autoPlacement,
  autoUpdate,
  offset,
  Placement,
  ReferenceType,
  useFloating,
} from '@floating-ui/react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useClickAway } from '@/hooks/click-away';
import { motion } from 'framer-motion';

const OpenContext = createContext<boolean | undefined>(undefined);
const ToggleOpenContext = createContext<(() => void) | undefined>(
  undefined,
);
const FloatingContext = createContext<
  | {
      id: string;
      reference: MutableRefObject<HTMLElement | null>;
      setReference: (node: ReferenceType | null) => void;
      setFloating: (node: HTMLElement | null) => void;
      floatingStyles: CSSProperties;
    }
  | undefined
>(undefined);

const useOpen = (): boolean => {
  const open = useContext(OpenContext);
  if (open === undefined) {
    throw new Error(
      'useOpen must be used within a DropdownMenu.Root',
    );
  }
  return open;
};

const useToggleOpen = (): (() => void) => {
  const toggleOpen = useContext(ToggleOpenContext);
  if (toggleOpen === undefined) {
    throw new Error(
      'useToggleOpen must be used within a DropdownMenu.Root',
    );
  }
  return toggleOpen;
};

const useFloatingContext = (): {
  id: string;
  reference: MutableRefObject<HTMLElement | null>;
  setReference: (node: ReferenceType | null) => void;
  setFloating: (node: HTMLElement | null) => void;
  floatingStyles: CSSProperties;
} => {
  const context = useContext(FloatingContext);
  if (context === undefined) {
    throw new Error(
      'useFloatingContext must be used within a DropdownMenu.Root',
    );
  }
  return context;
};

const Root: FC<PropsWithChildren<{ placement?: Placement }>> = ({
  children,
  placement = 'bottom-start',
}) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles } = useFloating({
    strategy: 'fixed',
    placement: placement,
    open: open,
    whileElementsMounted: autoUpdate,
    // 要素と8pxだけ離す
    middleware: [offset(8), autoPlacement()],
  });

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <OpenContext.Provider value={open}>
      <ToggleOpenContext.Provider value={toggleOpen}>
        <FloatingContext.Provider
          value={{
            id,
            reference:
              refs.reference as MutableRefObject<HTMLElement | null>,
            setReference: refs.setReference,
            setFloating: refs.setFloating,
            floatingStyles,
          }}
        >
          {children}
        </FloatingContext.Provider>
      </ToggleOpenContext.Provider>
    </OpenContext.Provider>
  );
};

const Content: FC<PropsWithChildren> = ({ children }) => {
  const ref = useRef<HTMLElement | null>(null);
  const open = useOpen();
  const { setFloating, floatingStyles } = useFloatingContext();

  useEffect(() => {
    ref.current = document.body;
  }, []);

  return (
    ref.current &&
    createPortal(
      <div ref={setFloating} style={floatingStyles}>
        <motion.div
          variants={{
            enter: {
              visibility: 'visible',
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
            exit: {
              transitionEnd: {
                visibility: 'hidden',
              },
              opacity: 0,
              scale: 0.4,
              transition: {
                duration: 0.1,
                easings: 'easeOut',
              },
            },
          }}
          initial={false}
          animate={open ? 'enter' : 'exit'}
        >
          {children}
        </motion.div>
      </div>,
      ref.current,
    )
  );
};

const ItemList: FC<PropsWithChildren> = ({ children }) => {
  const { id, reference } = useFloatingContext();
  const toggleOpen = useToggleOpen();
  const open = useOpen();
  const ref = useClickAway<HTMLDivElement>((event) => {
    if (!open) {
      return;
    }
    if (reference.current?.contains(event.target as HTMLElement)) {
      return;
    }
    toggleOpen();
  });

  return (
    <div
      ref={ref}
      id={`${id}_list`}
      tabIndex={-1}
      role="menu"
      aria-orientation="vertical"
      className="flex min-w-40 flex-col rounded-xl border border-borderSecondary bg-bgBase py-2 shadow-xl"
    >
      {children}
    </div>
  );
};

const Item: FC<PropsWithChildren<{ handleClick?: () => void }>> = ({
  children,
  handleClick,
}) => {
  const toggleOpen = useToggleOpen();
  return (
    <button
      role="menuitem"
      className="w-full px-2 py-1 text-left hover:bg-bgHover active:bg-bgActive"
      tabIndex={0}
      onClick={() => {
        toggleOpen();
        handleClick?.();
      }}
    >
      {children}
    </button>
  );
};

const Trigger: FC<{
  text: string;
}> = ({ text }) => {
  const open = useOpen();
  const toggleOpen = useToggleOpen();
  const { id, setReference } = useFloatingContext();

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={`${id}_list`}
      ref={setReference}
      onClick={toggleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          toggleOpen();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          toggleOpen();
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          toggleOpen();
        }
      }}
      className={cn(
        'rounded-xl font-bold',
        'bg-buttonPrimary text-textOnFill hover:bg-buttonHover active:bg-buttonActive',
        'focus-visible:border-borderTransparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus',
        'text-md px-4 py-2',
        'flex items-center justify-between gap-2',
      )}
    >
      {text}
      <ChevronDown className="size-8" />
    </button>
  );
};

const IconTrigger: FC<{
  icon: ReactNode;
  label: string;
}> = ({ icon, label }) => {
  const open = useOpen();
  const toggleOpen = useToggleOpen();
  const { id, setReference } = useFloatingContext();

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={`${id}_list`}
      ref={setReference}
      onClick={toggleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          toggleOpen();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          toggleOpen();
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          toggleOpen();
        }
      }}
      className={cn(
        'inline-flex rounded-full bg-bgTransparent hover:bg-bgHover focus-visible:ring-2 focus-visible:ring-borderFocus active:bg-bgActive',
        'p-2',
      )}
    >
      <span className="sr-only">{label}</span>
      {icon}
    </button>
  );
};

export const DropdownMenu = {
  Root,
  Content,
  ItemList,
  Item,
  Trigger,
  IconTrigger,
};
