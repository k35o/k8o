'use client';

import { cn } from '@k8o/helpers/cn';
import { useHash } from '@k8o/hooks/hash';
import * as motion from 'motion/react-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createContext,
  FC,
  KeyboardEvent,
  PropsWithChildren,
  RefObject,
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
  hashLink: boolean;
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
    hashLink?: boolean;
    defaultSelectedId?: string | null;
    ids: [string, ...string[]];
  }>
> = ({
  defaultSelectedId = null,
  ids,
  children,
  hashLink = false,
}) => {
  const defaultIndex = defaultSelectedId
    ? ids.indexOf(defaultSelectedId)
    : 0;
  const [selectedId, setSelectedId] = useState<string>(
    defaultSelectedId ?? ids[defaultIndex] ?? ids[0],
  );
  const rootId = useId();
  const router = useRouter();
  const hash = useHash();

  const hansleChangeHash = (id: string) => {
    router.push(`#${id}`, { scroll: false });
  };

  return (
    <TabsProvider
      value={{
        rootId,
        ids,
        selectedId: hashLink
          ? hash === '' || hash === null
            ? ids[0]
            : hash
          : selectedId,
        setSelectedId: hashLink ? hansleChangeHash : setSelectedId,
        hashLink,
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
    throw new Error(
      'useTabListState must be used within a TabListProvider',
    );
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
      id={`${rootId}-tablist`}
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      className="border-border-base flex overflow-x-auto overflow-y-hidden border-b p-0.5 wrap-normal"
    >
      <TabsListProvider value={{ setFocusRef }}>
        {children}
      </TabsListProvider>
    </div>
  );
};

const Tab: FC<PropsWithChildren<{ id: string }>> = ({
  id,
  children,
}) => {
  const { rootId, hashLink, ids, selectedId, setSelectedId } =
    useTabsState();
  const { setFocusRef } = useTabsListState();
  const ref = useRef<HTMLAnchorElement & HTMLDivElement>(null);
  const activeIndex = ids.indexOf(selectedId);
  const index = ids.indexOf(id);

  useEffect(() => {
    if (activeIndex === index && setFocusRef.current) {
      ref.current?.focus();
      setFocusRef.current = false;
    }
  }, [activeIndex, index]);

  const props = {
    id: `${rootId}-tab-${id}`,
    role: 'tab',
    'aria-controls':
      selectedId === id ? `${rootId}-panel-${id}` : undefined,
    'aria-selected': selectedId === id,
    tabIndex: activeIndex === index ? 0 : -1,
    className: cn(
      'relative cursor-pointer rounded-md p-2',
      'focus-visible:border-transparent focus-visible:ring-border-info focus-visible:ring-2 focus-visible:outline-hidden',
    ),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const nextActiveIndex =
          index === 0 ? ids.length - 1 : index - 1;
        setSelectedId(ids[nextActiveIndex] ?? ids[0]);
        setFocusRef.current = true;
        return;
      }
      if (e.key === 'ArrowRight') {
        const nextActiveIndex =
          index === ids.length - 1 ? 0 : index + 1;
        setSelectedId(ids[nextActiveIndex] ?? ids[0]);
        setFocusRef.current = true;
        return;
      }
    },
    children: (
      <>
        {selectedId === id && (
          <motion.div
            layoutId="underline"
            className="bg-primary-border absolute right-0 -bottom-0.5 left-0 h-1"
          />
        )}
        {children}
      </>
    ),
  };

  return hashLink ? (
    <Link ref={ref} href={`#${id}`} scroll={false} {...props} />
  ) : (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- propsを別の場所で定義することで解決済み
    <div
      ref={ref}
      onClick={() => {
        setSelectedId(id);
      }}
      {...props}
    />
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
      className={cn(
        'flex-grow rounded-md p-2',
        'focus-visible:ring-border-info focus-visible:border-transparent focus-visible:ring-2 focus-visible:outline-hidden',
      )}
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
