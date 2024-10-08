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
  Option,
  useMenuContent,
  useMenuItem,
  useMenuTrigger,
} from './hooks';
import clsx from 'clsx';
import { Popover } from '../popover';
import { useFloatingUIContext } from '../popover/hooks';
import { Button } from '../button';

const Root: FC<
  PropsWithChildren<{
    placement?: Placement;
    options: Option[];
    value: Option['key'] | undefined;
    onSelect: (key: Option['key']) => void;
  }>
> = ({
  children,
  placement = 'bottom',
  options,
  value,
  onSelect,
}) => {
  return (
    <Popover.Root placement={placement} type="listbox" flipDisabled>
      <MenuProvider
        options={options}
        value={value}
        onSelect={onSelect}
      >
        {children}
      </MenuProvider>
    </Popover.Root>
  );
};

const MenuProvider: FC<
  PropsWithChildren<{
    options: Option[];
    value: Option['key'] | undefined;
    onSelect: (key: Option['key']) => void;
  }>
> = ({ children, options, onSelect, value }) => {
  const selectedIndex = options.findIndex(
    (option) => option.key === value,
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

  const handleSelect = (index: number) => {
    const key = options[index]?.key;
    if (key) {
      onSelect(key);
    }
    return;
  };

  return (
    <MenuContextProvider
      value={{
        options,
        activeIndex,
        selectedIndex,
        handleSelect,
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
            className="flex max-h-48 min-w-56 flex-col overflow-y-auto rounded-xl border border-borderSecondary bg-bgBase py-2 shadow-xl"
          >
            {options.map(({ key, label }, idx) => (
              <Item key={key} label={label} index={idx} />
            ))}
          </section>
        )}
      />
    </FloatingList>
  );
};

const Item: FC<{
  label: Option['label'];
  index: number;
}> = ({ label, index }) => {
  const { props, selected } = useMenuItem(index);

  return (
    <button
      className={clsx(
        'w-full px-2 py-1 text-left',
        'hover:bg-bgHover hover:text-textBody',
        'active:bg-bgActive',
        'focus-visible:border-borderTransparent focus-visible:bg-bgHover focus-visible:outline-none',
        selected &&
          'bg-buttonHover text-textOnFill focus-visible:bg-buttonActive focus-visible:text-textOnFill',
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
          aria-label={label}
          type="button"
          size={size}
          color="gray"
          variant="contained"
          fullWidth
          endIcon={<ChevronDown aria-label="" className="size-8" />}
          {...getTriggerProps(props)}
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
