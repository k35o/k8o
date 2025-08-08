'use client';

import { cn } from '@k8o/helpers/cn';
import * as motion from 'motion/react-client';
import {
  createContext,
  type FC,
  type KeyboardEvent,
  type PropsWithChildren,
  type RefObject,
  use,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

type TabsContext = {
  rootId: string;
  ids: [string, ...string[]];
  selectedId: string;
  setSelectedId: (id: string) => void;
};

const TabsProvider = createContext<TabsContext | undefined>(undefined);

const useTabsState = (): TabsContext => {
  const context = use(TabsProvider);
  if (!context) {
    throw new Error('useTabsState must be used within a TabsProvider');
  }
  return context;
};

const Root: FC<
  PropsWithChildren<{
    defaultSelectedId?: string | null;
    ids: [string, ...string[]];
  }>
> = ({ defaultSelectedId = null, ids, children }) => {
  const defaultIndex = defaultSelectedId ? ids.indexOf(defaultSelectedId) : 0;
  const [selectedId, setSelectedId] = useState<string>(
    defaultSelectedId ?? ids[defaultIndex] ?? ids[0],
  );
  const rootId = useId();

  return (
    <TabsProvider
      value={{
        rootId,
        ids,
        selectedId,
        setSelectedId,
      }}
    >
      {/* TODO: スクロール以外の見せ方を考えても良さそう */}
      <div className="flex flex-col gap-1 overflow-x-auto p-0.5">
        {children}
      </div>
    </TabsProvider>
  );
};

const TabsListProvider = createContext<
  | {
      setFocusRef: RefObject<boolean>;
    }
  | undefined
>(undefined);

const useTabsListState = (): {
  setFocusRef: RefObject<boolean>;
} => {
  const context = use(TabsListProvider);
  if (!context) {
    throw new Error('useTabListState must be used within a TabListProvider');
  }
  return context;
};

const List: FC<
  PropsWithChildren<{
    label: string;
  }>
> = ({ label, children }) => {
  const { rootId } = useTabsState();
  const setFocusRef = useRef<boolean>(false);
  return (
    <div
      aria-label={label}
      aria-orientation="horizontal"
      className="wrap-normal flex overflow-x-auto overflow-y-hidden border-border-base border-b p-0.5"
      id={`${rootId}-tablist`}
      role="tablist"
    >
      <TabsListProvider value={{ setFocusRef }}>{children}</TabsListProvider>
    </div>
  );
};

const Tab: FC<PropsWithChildren<{ id: string }>> = ({ id, children }) => {
  const { rootId, ids, selectedId, setSelectedId } = useTabsState();
  const { setFocusRef } = useTabsListState();
  const ref = useRef<HTMLAnchorElement & HTMLDivElement>(null);
  const activeIndex = ids.indexOf(selectedId);
  const index = ids.indexOf(id);

  useEffect(() => {
    if (activeIndex === index && setFocusRef.current) {
      ref.current?.focus();
      setFocusRef.current = false;
    }
  }, [activeIndex, index, setFocusRef]);

  return (
    <div
      aria-controls={selectedId === id ? `${rootId}-panel-${id}` : undefined}
      aria-selected={selectedId === id}
      className={cn(
        'relative cursor-pointer rounded-md p-2',
        'focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border-info',
      )}
      id={`${rootId}-tab-${id}`}
      onClick={() => {
        setSelectedId(id);
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          const nextActiveIndex = index === 0 ? ids.length - 1 : index - 1;
          setSelectedId(ids[nextActiveIndex] ?? ids[0]);
          setFocusRef.current = true;
          return;
        }
        if (e.key === 'ArrowRight') {
          const nextActiveIndex = index === ids.length - 1 ? 0 : index + 1;
          setSelectedId(ids[nextActiveIndex] ?? ids[0]);
          setFocusRef.current = true;
          return;
        }
      }}
      ref={ref}
      role="tab"
      tabIndex={activeIndex === index ? 0 : -1}
    >
      {selectedId === id && (
        <motion.div
          className="-bottom-0.5 absolute right-0 left-0 h-1 bg-primary-border"
          layoutId="underline"
        />
      )}
      {children}
    </div>
  );
};

const Panel: FC<PropsWithChildren<{ id: string }>> = ({ id, children }) => {
  const { rootId, selectedId } = useTabsState();

  if (selectedId !== id) {
    return null;
  }

  return (
    <div
      aria-labelledby={`${rootId}-tab-${id}`}
      className={cn(
        'flex-grow rounded-md p-2',
        'focus-visible:border-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border-info',
      )}
      id={`${rootId}-panel-${id}`}
      role="tabpanel"
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
