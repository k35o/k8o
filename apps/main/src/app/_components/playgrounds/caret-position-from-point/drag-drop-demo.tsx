'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { useCallback, useRef, useState } from 'react';

const INITIAL_TEXT = '吾輩は猫である。名前はまだ無い。';
const DRAGGABLE_WORDS = ['素敵な', '可愛い', '立派な'];

/**
 * ドラッグ&ドロップでテキスト挿入するデモ
 */
export function DragDropDemo() {
  const [text, setText] = useState(INITIAL_TEXT);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const textRef = useRef<HTMLParagraphElement>(null);

  const handleDragStart = useCallback(
    (event: React.DragEvent, word: string) => {
      event.dataTransfer.setData('text/plain', word);
      event.dataTransfer.effectAllowed = 'copy';
    },
    [],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    if (!('caretPositionFromPoint' in document)) {
      setIsSupported(false);
      return;
    }

    const droppedText = event.dataTransfer.getData('text/plain');
    if (!droppedText) return;

    const caretPosition = document.caretPositionFromPoint(
      event.clientX,
      event.clientY,
    );

    if (caretPosition && caretPosition.offsetNode.nodeType === Node.TEXT_NODE) {
      const textContent = caretPosition.offsetNode.textContent ?? '';
      const offset = caretPosition.offset;
      const before = textContent.slice(0, offset);
      const after = textContent.slice(offset);
      setText(before + droppedText + after);
    }
  }, []);

  const handleReset = useCallback(() => {
    setText(INITIAL_TEXT);
  }, []);

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-border-base bg-bg-mute p-3">
        <p className="text-fg-mute text-sm">
          このブラウザはこのAPIをサポートしていません。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {DRAGGABLE_WORDS.map((word) => (
          // biome-ignore lint/a11y/noNoninteractiveElementInteractions: ドラッグ可能な要素のデモ
          // biome-ignore lint/a11y/noStaticElementInteractions: ドラッグ可能な要素のデモ
          <span
            className="cursor-grab rounded bg-primary-bg px-2 py-1 text-primary-fg text-sm active:cursor-grabbing"
            draggable
            key={word}
            onDragStart={(e) => handleDragStart(e, word)}
          >
            {word}
          </span>
        ))}
        <Button color="gray" onClick={handleReset} size="sm" variant="outlined">
          リセット
        </Button>
      </div>

      {/* biome-ignore lint/a11y/useSemanticElements: ドラッグ&ドロップのデモ用ドロップターゲット */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: ドラッグ&ドロップのデモ用ドロップターゲット */}
      <div
        aria-label="テキスト挿入エリア"
        className={`rounded-lg border p-3 transition-colors ${
          isDragOver
            ? 'border-primary-border bg-primary-bg/10'
            : 'border-border-base bg-bg-base'
        }`}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="region"
      >
        <p className="text-fg-base text-sm leading-relaxed" ref={textRef}>
          {text}
        </p>
        <p className="mt-2 text-fg-mute text-xs">
          ↑ 上のワードをドラッグしてここにドロップ
        </p>
      </div>
    </div>
  );
}
