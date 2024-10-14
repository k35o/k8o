'use client';

import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';
import { ListBox } from '../../../components/list-box';
import { Transfer } from './transfer';
import { Blend, Info } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { useOpenContext } from '@/components/popover';

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
  const value = useContext(ColorFilterContext);
  const setValue = useContext(SetColorFilterContext);
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
    <ColorFilterContext.Provider value={filter}>
      <SetColorFilterContext.Provider value={setFilter}>
        <div
          style={{
            filter:
              filter === 'nomaly' ? undefined : `url('#${filter}')`,
          }}
        >
          {children}
        </div>
        <Transfer />
      </SetColorFilterContext.Provider>
    </ColorFilterContext.Provider>
  );
};

export const ColorFilterBox: FC = () => {
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
    >
      <ListBox.TriggerIcon icon={<Blend className="size-8" />} />
      <ListBox.Content helpContent={<HelpContent />} />
    </ListBox.Root>
  );
};

const HelpContent: FC = () => {
  const { onClose } = useOpenContext();
  return (
    <Link
      href="/blog/color-perception"
      onClick={onClose}
      className={clsx(
        'inline-flex w-full items-center gap-1 px-2 py-1',
        'hover:bg-bgHover hover:text-textBody',
        'active:bg-bgActive',
        'focus-visible:border-borderTransparent focus-visible:bg-bgHover focus-visible:outline-none',
      )}
    >
      {<Info className="size-6 text-textInfo" />}
      色覚特性について
    </Link>
  );
};
