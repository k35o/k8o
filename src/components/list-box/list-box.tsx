'use client';

import {
  ComponentProps,
  FC,
  PropsWithChildren,
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
import {
  MenuContextProvider,
  useMenuContent,
  useMenuItem,
  useMenuTrigger,
} from './hooks';
import clsx from 'clsx';
import { Popover } from '../popover';
import { useFloatingUIContext } from '../popover/hooks';
import { Button } from '../button';

const Root: FC<
  PropsWithChildren<{ placement?: Placement; options: string[] }>
> = ({ children, placement = 'bottom-start', options }) => {
  return (
    <Popover.Root placement={placement} type="listbox">
      <MenuProvider options={options}>{children}</MenuProvider>
    </Popover.Root>
  );
};

const MenuProvider: FC<PropsWithChildren<{ options: string[] }>> = ({
  children,
  options,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    null,
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const itemElementsRef = useRef<(HTMLElement | null)[]>([]);

  const context = useFloatingUIContext();

  const listNavigation = useListNavigation(context, {
    listRef: itemElementsRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } =
    useInteractions([listNavigation]);

  return (
    <MenuContextProvider
      value={{
        options,
        activeIndex,
        selectedIndex,
        setSelectedIndex,
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

const Content: FC = () => {
  const { options, contentProps, itemElementsRef } = useMenuContent();

  return (
    <FloatingList elementsRef={itemElementsRef}>
      <Popover.Content
        renderItem={(props) => (
          <section
            {...props}
            {...contentProps}
            className="flex min-w-40 flex-col rounded-xl border border-borderSecondary bg-bgBase py-2 shadow-xl"
          >
            {options.map((label, idx) => (
              <Item key={label} label={label} index={idx} />
            ))}
          </section>
        )}
      />
    </FloatingList>
  );
};

const Item: FC<{ label: string; index: number }> = ({
  label,
  index,
}) => {
  const props = useMenuItem(index);

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
  size?: ComponentProps<typeof Button>['size'];
}> = ({ size = 'md' }) => {
  const { label, getTriggerProps } = useMenuTrigger();

  return (
    <Popover.Trigger
      renderItem={(props) => (
        <Button
          type="button"
          size={size}
          variant="contained"
          endIcon={<ChevronDown className="size-8" />}
          {...props.restProps}
          {...getTriggerProps(props.actionProps)}
        >
          {label}
        </Button>
      )}
    />
  );
};

export const ListBox = {
  Root,
  Content,
  Trigger,
};
