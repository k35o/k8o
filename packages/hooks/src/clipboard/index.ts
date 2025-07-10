import { useCallback } from 'react';

export const useClipboard = () => {
  const writeClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
  }, []);

  const readClipboard = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    return text;
  }, []);

  return {
    writeClipboard,
    readClipboard,
  };
};
