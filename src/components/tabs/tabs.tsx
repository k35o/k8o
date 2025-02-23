'use client';

import { cn } from '@/utils/cn';
import {
  createContext,
  FC,
  PropsWithChildren,
  use,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

type TabsContext = {
  rootId: string;
  ids: [string, ...string[]];
  activeIndex: number;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
};

const TabsProvider = createContext<TabsContext | undefined>(
  undefined,
);

const useTabsState = (): TabsContext => {
  const context = use(TabsProvider);
  if (!context) {
    throw new Error(
      'useTabsState must be used within a TabsProvider',
    );
  }
  return context;
};

const Root: FC<
  PropsWithChildren<{
    defaultSelectedId?: string | null;
    ids: [string, ...string[]];
  }>
> = ({ defaultSelectedId = null, ids, children }) => {
  const defaultIndex = defaultSelectedId
    ? ids.indexOf(defaultSelectedId)
    : 0;
  const [selectedId, setSelectedId] = useState<string>(
    defaultSelectedId ?? ids[defaultIndex] ?? ids[0],
  );
  const activeIndex = ids.indexOf(selectedId);
  const rootId = useId();

  return (
    <TabsProvider
      value={{
        rootId,
        ids,
        activeIndex,
        selectedId,
        setSelectedId,
      }}
    >
      <div className="flex flex-col gap-1">{children}</div>
    </TabsProvider>
  );
};

const List: FC<
  PropsWithChildren<{
    label: string;
  }>
> = ({ label, children }) => {
  const { rootId } = useTabsState();
  return (
    <div
      id={`${rootId}-tablist`}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      className="border-border-base flex border-b"
    >
      {children}
    </div>
  );
};

const Tab: FC<PropsWithChildren<{ id: string }>> = ({
  id,
  children,
}) => {
  const { rootId, ids, activeIndex, selectedId, setSelectedId } =
    useTabsState();
  const ref = useRef<HTMLDivElement>(null);
  const index = ids.indexOf(id);

  useEffect(() => {
    if (activeIndex === index) {
      ref.current?.focus();
    }
  }, [activeIndex, index]);

  return (
    <div
      ref={ref}
      id={`${rootId}-tab-${id}`}
      role="tab"
      aria-controls={
        selectedId === id ? `${rootId}-panel-${id}` : undefined
      }
      aria-selected={selectedId === id}
      tabIndex={activeIndex === index ? 0 : -1}
      className={cn(
        'cursor-pointer p-3',
        selectedId === id && 'border-primary-border border-b-3',
      )}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          const nextActiveIndex =
            index === 0 ? ids.length - 1 : index - 1;
          setSelectedId(ids[nextActiveIndex] ?? ids[0]);
          return;
        }
        if (e.key === 'ArrowRight') {
          const nextActiveIndex =
            index === ids.length - 1 ? 0 : index + 1;
          setSelectedId(ids[nextActiveIndex] ?? ids[0]);
          return;
        }
        if (e.key === 'Enter') {
          setSelectedId(id);
          return;
        }
      }}
      onClick={() => { setSelectedId(id); }}
    >
      {children}
    </div>
  );
};

const Panel: FC<PropsWithChildren<{ id: string }>> = ({
  id,
  children,
}) => {
  const { rootId, selectedId } = useTabsState();

  if (selectedId !== id) {
    return null;
  }

  return (
    <div
      id={`${rootId}-panel-${id}`}
      role="tabpanel"
      aria-labelledby={`${rootId}-tab-${id}`}
      tabIndex={0}
      className="p-3"
    >
      {children}
    </div>
  );
};

export const Tabs = {
  Root,
  List,
  Tab,
  Panel,
};
