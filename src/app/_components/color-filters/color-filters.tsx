'use client';

import { Transfer } from './transfer';
import { AlertIcon, MixedColorIcon } from '@/components/icons';
import { ListBox } from '@/components/list-box';
import { useOpenContext } from '@/components/popover';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import {
  createContext,
  FC,
  PropsWithChildren,
  use,
  useCallback,
  useState,
} from 'react';

const FILTERS = [
  { key: 'nomaly', name: '3色覚' },
  { key: 'protanomaly', name: '1型3色覚' },
  { key: 'protanopia', name: '1型2色覚' },
  { key: 'deuteranomaly', name: '2型3色覚' },
  { key: 'deuteranopia', name: '2型2色覚' },
  { key: 'tritanomaly', name: '3型3色覚' },
  { key: 'tritanopia', name: '3型2色覚' },
  { key: 'achromatopsia', name: '1色覚' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

const ColorFilterContext = createContext<FilterKey>('nomaly');
const SetColorFilterContext = createContext<
  ((key: FilterKey) => void) | undefined
>(undefined);

const useColorFilter = () => {
  const value = use(ColorFilterContext);
  const setValue = use(SetColorFilterContext);
  if (!setValue) {
    throw new Error(
      'useColorFilter must be used within a ColorFilterProvider',
    );
  }
  return [value, setValue] as const;
};

export const ColorFilterProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [filter, setFilter] = useState<FilterKey>('nomaly');

  return (
    <ColorFilterContext value={filter}>
      <SetColorFilterContext value={setFilter}>
        <div
          style={{
            filter:
              filter === 'nomaly' ? undefined : `url('#${filter}')`,
          }}
        >
          {children}
        </div>
        <Transfer />
      </SetColorFilterContext>
    </ColorFilterContext>
  );
};

export const ColorFilterBox: FC<{ placement?: 'top' | 'bottom' }> = ({
  placement = 'bottom',
}) => {
  const [selectedFilter, setSelectedFilter] = useColorFilter();
  const handleSelect = useCallback(
    (filter: string) => {
      setSelectedFilter(filter as FilterKey);
    },
    [setSelectedFilter],
  );

  return (
    <ListBox.Root
      options={FILTERS.map((filter) => ({
        key: filter.key,
        label: filter.name,
      }))}
      value={selectedFilter}
      onSelect={handleSelect}
      placement={placement}
    >
      <ListBox.TriggerIcon icon={<MixedColorIcon size="lg" />} />
      <ListBox.Content helpContent={<HelpContent />} />
    </ListBox.Root>
  );
};

const HelpContent: FC = () => {
  const { onClose } = useOpenContext();
  return (
    <Link
      href={'/blog/color-perception'}
      onNavigate={onClose}
      className={cn(
        'inline-flex w-full items-center gap-1 px-2 py-1',
        'hover:bg-primary-bg hover:text-fg-inverse',
        'focus-visible:bg-primary-bg focus-visible::text-fg-inverse focus-visible:border-transparent focus-visible:outline-hidden',
      )}
    >
      <span className="text-fg-info">
        <AlertIcon status="info" />
      </span>
      色覚特性について
    </Link>
  );
};
