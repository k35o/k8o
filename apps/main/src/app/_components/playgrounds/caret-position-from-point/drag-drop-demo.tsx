'use client';

import { Button } from '@k8o/arte-odyssey';
import { useCallback, useRef, useState } from 'react';

const INITIAL_TEXT = '吾輩は猫である。名前はまだ無い。';
const DRAGGABLE_WORDS = ['素敵な', '可愛い', '立派な'];

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

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    // dragleave は子要素へ移った際にも発火するため、領域外へ出たときだけ解除する
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
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

    // ヒント文など本文以外のテキストノードへのドロップで text が置き換わるのを防ぐ
    if (
      caretPosition &&
      caretPosition.offsetNode.nodeType === Node.TEXT_NODE &&
      textRef.current?.contains(caretPosition.offsetNode) === true
    ) {
      const textContent = caretPosition.offsetNode.textContent ?? '';
      const { offset } = caretPosition;
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
      <div className="bg-bg-mute rounded-xl p-3">
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
          <span
            className="bg-primary-bg text-primary-fg cursor-grab rounded-sm px-2 py-1 text-sm active:cursor-grabbing"
            draggable
            key={word}
            onDragStart={(e) => {
              handleDragStart(e, word);
            }}
          >
            {word}
          </span>
        ))}
        <Button color="gray" onClick={handleReset} size="sm" variant="outline">
          リセット
        </Button>
      </div>

      {/* caretPositionFromPoint はマウス座標前提で、ドロップはキーボード操作不可。
          region ロールを持つ section だとイベントハンドラがエラーになるため div を使う */}
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
      >
        <p className="text-fg-base text-sm leading-relaxed" ref={textRef}>
          {text}
        </p>
        <p className="text-fg-mute mt-2 text-xs">
          ↑ 上のワードをドラッグしてここにドロップ
        </p>
      </div>
    </div>
  );
}
