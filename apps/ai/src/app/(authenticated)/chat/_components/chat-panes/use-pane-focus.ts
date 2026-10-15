import { useRef } from 'react';
import type { RefCallback, RefObject } from 'react';
import { flushSync } from 'react-dom';

type PaneFocus = {
  headingRef: RefObject<HTMLHeadingElement | null>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  artifactButtonRef: (toolCallId: string) => RefCallback<HTMLButtonElement>;
  openPane: (toolCallId: string, open: () => void) => void;
  closePane: (toolCallId: string, close: () => void) => void;
};

// xl 未満でカードからペインを開くと押したボタンごと会話が隠れ、xl でペインを閉じると閉じるボタンごと消えて、
// どちらもフォーカスが body に落ちる。そのため、開くときはペインの見出しへ、閉じるときはカードのボタンへ移す
export const usePaneFocus = (): PaneFocus => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const artifactButtonsRef = useRef(new Map<string, HTMLButtonElement>());
  return {
    headingRef,
    inputRef,
    artifactButtonRef: (toolCallId) => (button) => {
      if (button !== null) {
        artifactButtonsRef.current.set(toolCallId, button);
      }
      return () => {
        artifactButtonsRef.current.delete(toolCallId);
      };
    },
    openPane: (toolCallId, open) => {
      const trigger = artifactButtonsRef.current.get(toolCallId);
      // 開いたペインの見出しが DOM に入り、押したボタンが隠れたかを確かめられるよう、描き終えてから移す。
      // 隠れたかで決めるので、xl の切り替え幅を JS に持たない
      flushSync(open);
      if (trigger?.checkVisibility() === false) {
        headingRef.current?.focus();
      }
    },
    closePane: (toolCallId, close) => {
      (artifactButtonsRef.current.get(toolCallId) ?? inputRef.current)?.focus();
      close();
    },
  };
};
