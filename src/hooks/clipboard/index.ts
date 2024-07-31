import { useToast } from '@/components/toast';
import { useCallback } from 'react';

export const useClipboard = () => {
  const { onOpen } = useToast();

  const writeClipboard = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      onOpen('success', 'クリップボードにコピーしました');
    },
    [onOpen],
  );

  const readClipboard = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    return text;
  }, []);

  return {
    writeClipboard,
    readClipboard,
  };
};
