'use client';

import {
  FC,
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  FloatingPortal,
  offset,
  Placement,
  useFloating,
  useInteractions,
  useListItem,
  useListNavigation,
} from '@floating-ui/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  MenuContextProvider,
  useMenuContent,
  useMenuItem,
  useMenuTrigger,
} from './hooks';
import clsx from 'clsx';

const Root: FC<PropsWithChildren<{ placement?: Placement }>> = ({
  children,
  placement = 'bottom-start',
}) => {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const itemElementsRef = useRef<(HTMLElement | null)[]>([]);

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
  });

  const listNavigation = useListNavigation(context, {
    listRef: itemElementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } =
    useInteractions([listNavigation]);

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
    <MenuContextProvider
      value={{
        rootId: id,
        activeIndex,
        isOpen,
        toggleOpen,
        onOpen,
        onClose,
        context,
        triggerRef: refs.domReference,
        setTriggerRef: refs.setReference,
        setContentRef: refs.setFloating,
        contentStyles: floatingStyles,
        itemElementsRef,
        getTriggerProps: getReferenceProps,
        getContentProps: getFloatingProps,
        getItemProps,
      }}
    >
      {children}
    </MenuContextProvider>
  );
};

const Content: FC<PropsWithChildren> = ({ children }) => {
  const {
    id,
    ref,
    isOpen,
    context,
    setContentRef,
    contentStyles,
    contentProps,
    itemElementsRef,
  } = useMenuContent();

  return (
    <FloatingList elementsRef={itemElementsRef}>
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={setContentRef}
              style={contentStyles}
              {...contentProps}
            >
              <section
                ref={ref}
                id={id}
                role="menu"
                aria-orientation="vertical"
                className="flex min-w-40 flex-col rounded-xl border border-borderSecondary bg-bgBase py-2 shadow-xl"
                tabIndex={-1}
              >
                {children}
              </section>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </FloatingList>
  );
};

const Item: FC<{ onClick: MouseEventHandler; label: string }> = ({
  label,
  onClick,
}) => {
  const { activeIndex, props } = useMenuItem({ onClick });

  const item = useListItem({ label });
  return (
    <button
      ref={item.ref}
      role="menuitem"
      tabIndex={activeIndex === item.index ? 0 : -1}
      className={clsx(
        'w-full px-2 py-1 text-left',
        'hover:bg-bgHover',
        'active:bg-bgActive',
        'focus-visible:border-borderTransparent focus-visible:bg-bgHover focus-visible:outline-none',
      )}
      {...props}
    >
      {label}
    </button>
  );
};

const Trigger: FC<{
  text: string;
}> = ({ text }) => {
  const { contentId, isOpen, setRef, props } = useMenuTrigger();

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={contentId}
      ref={setRef}
      className={cn(
        'rounded-xl font-bold',
        'bg-buttonPrimary text-textOnFill hover:bg-buttonHover active:bg-buttonActive',
        'focus-visible:border-borderTransparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus',
        'text-md px-4 py-2',
        'flex items-center justify-between gap-2',
      )}
      {...props}
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
  const { contentId, isOpen, setRef, props } = useMenuTrigger();

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={contentId}
      ref={setRef}
      className={cn(
        'inline-flex rounded-full bg-bgTransparent hover:bg-bgHover focus-visible:ring-2 focus-visible:ring-borderFocus active:bg-bgActive',
        'p-2',
      )}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {icon}
    </button>
  );
};

export const DropdownMenu = {
  Root,
  Content,
  Item,
  Trigger,
  IconTrigger,
};
