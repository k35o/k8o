'use client';

import {
  MenuContextProvider,
  useMenuContent,
  useMenuItem,
  useMenuTrigger,
} from './hooks';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { ChevronIcon } from '../icons';
import { Popover } from '../popover';
import { useFloatingUIContext } from '../popover/hooks';
import { cn } from '@/helpers/cn';
import {
  FloatingList,
  Placement,
  useInteractions,
  useListNavigation,
} from '@floating-ui/react';
import {
  ComponentProps,
  FC,
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  useRef,
  useState,
} from 'react';

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
            className="border-border-mute bg-bg-base flex min-w-40 flex-col rounded-lg border py-2 shadow-xl"
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
      className={cn(
        'w-full px-2 py-1 text-left',
        'hover:bg-primary-bg',
        'focus-visible:bg-primary-bg focus-visible:border-transparent focus-visible:outline-hidden',
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
          type="button"
          size={size}
          color="gray"
          variant={variant}
          endIcon={<ChevronIcon direction="down" />}
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
        <IconButton
          bg="base"
          label={label}
          {...getTriggerProps(props)}
        >
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
