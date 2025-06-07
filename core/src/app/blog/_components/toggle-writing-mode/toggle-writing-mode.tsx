'use client';

import { IconButton } from '@/components/icon-button';
import { HorizontalIcon, VerticalIcon } from '@/components/icons';
import {
  createContext,
  FC,
  PropsWithChildren,
  use,
  useCallback,
  useState,
} from 'react';

type WritingModeContextType = 'horizontal-tb' | 'vertical-rl';

const WritingModeContext =
  createContext<WritingModeContextType>('horizontal-tb');
const ToggleWritingModeContext = createContext<() => void>(() => {
  /* noop */
});

export const WritingModeProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [writingMode, setWritingMode] = useState<
    'horizontal-tb' | 'vertical-rl'
  >('vertical-rl');
  const toggleWritingMode = useCallback(() => {
    setWritingMode((prev) =>
      prev === 'horizontal-tb' ? 'vertical-rl' : 'horizontal-tb',
    );
  }, []);

  return (
    <WritingModeContext value={writingMode}>
      <ToggleWritingModeContext value={toggleWritingMode}>
        {children}
      </ToggleWritingModeContext>
    </WritingModeContext>
  );
};

export const useWritingModeValue = () => use(WritingModeContext);

export const ToggleWritingMode: FC = () => {
  const writingMode = useWritingModeValue();
  const setWritingMode = use(ToggleWritingModeContext);
  return (
    <IconButton
      onClick={setWritingMode}
      label={
        writingMode === 'horizontal-tb'
          ? '縦書きに切り替え'
          : '横書きに切り替え'
      }
    >
      <span className="relative size-6">
        <span className="absolute -top-0.5 -left-0.5 text-sm leading-none font-bold">
          文
        </span>
        <span className="absolute -right-0.5 -bottom-0.5">
          {writingMode === 'horizontal-tb' ? (
            <HorizontalIcon size="sm" />
          ) : (
            <VerticalIcon size="sm" />
          )}
        </span>
      </span>
    </IconButton>
  );
};
