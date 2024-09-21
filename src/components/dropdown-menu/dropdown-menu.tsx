'use client';

import {
  FC,
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  useRef,
  useState,
} from 'react';
import {
  FloatingList,
  Placement,
  useInteractions,
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
import { Popover } from '../popover';
import { useFloatingUIContext } from '../popover/hooks';

const Root: FC<PropsWithChildren<{ placement?: Placement }>> = ({
  children,
  placement = 'bottom-start',
}) => {
  return (
    <Popover.Root placement={placement}>
      <MenuProvider>{children}</MenuProvider>
    </Popover.Root>
  );
};

const MenuProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const itemElementsRef = useRef<(HTMLElement | null)[]>([]);

  const context = useFloatingUIContext();

  const listNavigation = useListNavigation(context, {
    listRef: itemElementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } =
    useInteractions([listNavigation]);

  return (
    <MenuContextProvider
      value={{
        activeIndex,
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
  const { contentProps, itemElementsRef } = useMenuContent();

  return (
    <FloatingList elementsRef={itemElementsRef}>
      <Popover.Content
        renderItem={(props) => (
          <section
            {...props}
            {...contentProps}
            className="flex min-w-40 flex-col rounded-xl border border-borderSecondary bg-bgBase py-2 shadow-xl"
          >
            {children}
          </section>
        )}
      />
    </FloatingList>
  );
};

const Item: FC<{ onClick: MouseEventHandler; label: string }> = ({
  label,
  onClick,
}) => {
  const props = useMenuItem({ onClick });

  return (
    <button
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
  const getTriggerProps = useMenuTrigger();

  return (
    <Popover.Trigger
      renderItem={(props) => (
        <button
          type="button"
          className={cn(
            'rounded-xl font-bold',
            'bg-buttonPrimary text-textOnFill hover:bg-buttonHover active:bg-buttonActive',
            'focus-visible:border-borderTransparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-borderFocus',
            'text-md px-4 py-2',
            'flex items-center justify-between gap-2',
          )}
          {...props.restProps}
          {...getTriggerProps(props.actionProps)}
        >
          {text}
          <ChevronDown className="size-8" />
        </button>
      )}
    />
  );
};

const IconTrigger: FC<{
  icon: ReactNode;
  label: string;
}> = ({ icon, label }) => {
  const getTriggerProps = useMenuTrigger();

  return (
    <Popover.Trigger
      renderItem={(props) => (
        <button
          type="button"
          className={cn(
            'inline-flex rounded-full bg-bgTransparent hover:bg-bgHover focus-visible:ring-2 focus-visible:ring-borderFocus active:bg-bgActive',
            'p-2',
          )}
          {...props.restProps}
          {...getTriggerProps(props.actionProps)}
        >
          <span className="sr-only">{label}</span>
          {icon}
        </button>
      )}
    />
  );
};

export const DropdownMenu = {
  Root,
  Content,
  Item,
  Trigger,
  IconTrigger,
};
