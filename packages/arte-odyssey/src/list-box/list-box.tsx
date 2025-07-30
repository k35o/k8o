'use client';

import {
  MenuContextProvider,
  Option,
  useMenuContent,
  useMenuItem,
  useMenuTrigger,
} from './hooks';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { CheckIcon, ChevronIcon } from '../icons';
import { Popover } from '../popover';
import { useFloatingUIContext } from '../popover/hooks';
import {
  FloatingList,
  Placement,
  useInteractions,
  useListNavigation,
} from '@floating-ui/react';
import { cn } from '@k8o/helpers/cn';
import {
  ComponentProps,
  FC,
  PropsWithChildren,
  ReactElement,
  useRef,
  useState,
} from 'react';

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

const Content: FC<{
  helpContent?: ReactElement;
}> = ({ helpContent }) => {
  const { options, contentProps, itemElementsRef } = useMenuContent();

  return (
    <FloatingList elementsRef={itemElementsRef}>
      <Popover.Content
        renderItem={(props) => (
          <div
            {...props}
            {...contentProps}
            className="border-border-mute bg-bg-base flex max-h-48 min-w-40 flex-col overflow-y-auto rounded-lg border py-2 shadow-xl"
          >
            {helpContent}
            {options.map(({ key, label }, idx) => (
              <Item key={key} label={label} index={idx} />
            ))}
          </div>
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
      className={cn(
        'group w-full px-2 py-1 text-left',
        'hover:bg-primary-bg',
        'focus-visible:bg-primary-bg focus-visible:border-transparent focus-visible:outline-hidden',
        !selected && 'pl-9',
        selected && 'inline-flex items-center gap-1',
      )}
      {...props}
    >
      {selected && (
        <span className="text-fg-success group-hover:text-fg-base group-focus-visible:text-fg-base">
          <CheckIcon />
        </span>
      )}
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
          aria-label={label}
          size={size}
          color="gray"
          variant="contained"
          fullWidth
          endIcon={<ChevronIcon direction="down" />}
          {...getTriggerProps(props)}
        >
          {label}
        </Button>
      )}
    />
  );
};

const TriggerIcon: FC<{
  size?: ComponentProps<typeof Button>['size'];
  icon: ReactElement;
}> = ({ size = 'md', icon }) => {
  const { label, getTriggerProps } = useMenuTrigger();

  return (
    <Popover.Trigger
      renderItem={(props) => (
        <IconButton
          label={label}
          size={size}
          {...getTriggerProps(props)}
        >
          {icon}
        </IconButton>
      )}
    />
  );
};

export const ListBox = {
  Root,
  Content,
  Trigger,
  TriggerIcon,
};
