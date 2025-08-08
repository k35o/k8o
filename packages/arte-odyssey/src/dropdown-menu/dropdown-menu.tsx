'use client';

import {
  FloatingList,
  type Placement,
  useInteractions,
  useListNavigation,
} from '@floating-ui/react';
import { cn } from '@k8o/helpers/cn';
import {
  type ComponentProps,
  type FC,
  type MouseEventHandler,
  type PropsWithChildren,
  type ReactNode,
  useRef,
  useState,
} from 'react';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { ChevronIcon } from '../icons';
import { Popover } from '../popover';
import { useFloatingUIContext } from '../popover/hooks';
import {
  MenuContextProvider,
  useMenuContent,
  useMenuItem,
  useMenuTrigger,
} from './hooks';

const Root: FC<PropsWithChildren<{ placement?: Placement }>> = ({
  children,
  placement = 'bottom-start',
}) => {
  return (
    <Popover.Root placement={placement} type="menu">
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
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [listNavigation],
  );

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
          <div
            {...props}
            {...contentProps}
            className="flex min-w-40 flex-col rounded-lg border border-border-mute bg-bg-base py-2 shadow-xl"
          >
            {children}
          </div>
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
      className={cn(
        'w-full px-2 py-1 text-left',
        'hover:bg-primary-bg',
        'focus-visible:border-transparent focus-visible:bg-primary-bg focus-visible:outline-hidden',
      )}
      {...props}
    >
      {label}
    </button>
  );
};

const Trigger: FC<{
  text: string;
  size?: ComponentProps<typeof Button>['size'];
  variant?: ComponentProps<typeof Button>['variant'];
}> = ({ text, size = 'md', variant = 'contained' }) => {
  const getTriggerProps = useMenuTrigger();

  return (
    <Popover.Trigger
      renderItem={(props) => (
        <Button
          color="gray"
          endIcon={<ChevronIcon direction="down" />}
          size={size}
          type="button"
          variant={variant}
          {...getTriggerProps(props)}
        >
          {text}
        </Button>
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
        <IconButton bg="base" label={label} {...getTriggerProps(props)}>
          {icon}
        </IconButton>
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
