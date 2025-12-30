'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { useCallback, useState } from 'react';

type CaretInfo = {
  offsetNodeType: string;
  offsetNodeName: string;
  offsetNodeText: string | null;
  offset: number;
  rectX: number | null;
  rectY: number | null;
  clickX: number;
  clickY: number;
};

/**
 * document.caretPositionFromPointのデモ
 * テキストをクリックするとキャレット位置の情報を表示する
 */
export function CaretPositionDemo() {
  const [caretInfo, setCaretInfo] = useState<CaretInfo | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!('caretPositionFromPoint' in document)) {
      setIsSupported(false);
      return;
    }

    const caretPosition = document.caretPositionFromPoint(
      event.clientX,
      event.clientY,
    );

    if (!caretPosition) {
      setCaretInfo(null);
      return;
    }

    const rect = caretPosition.getClientRect();

    setCaretInfo({
      offsetNodeType:
        caretPosition.offsetNode.nodeType === Node.TEXT_NODE
          ? 'TEXT_NODE'
          : 'ELEMENT_NODE',
      offsetNodeName: caretPosition.offsetNode.nodeName,
      offsetNodeText:
        caretPosition.offsetNode.nodeType === Node.TEXT_NODE
          ? (caretPosition.offsetNode.textContent?.slice(0, 30) ?? null)
          : null,
      offset: caretPosition.offset,
      rectX: rect?.x ?? null,
      rectY: rect?.y ?? null,
      clickX: event.clientX,
      clickY: event.clientY,
    });
  }, []);

  const handleReset = useCallback(() => {
    setCaretInfo(null);
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
      {/* biome-ignore lint/a11y/noStaticElementInteractions: caretPositionFromPointデモ用のクリックエリア */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: caretPositionFromPointデモ用のクリックエリア */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: caretPositionFromPointはマウス座標を必要とするためキーボードでは使用不可 */}
      <div
        className="cursor-text select-none rounded-lg border border-border-base bg-bg-base p-3"
        onClick={handleClick}
      >
        <p className="text-fg-base text-sm leading-relaxed">
          吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。
        </p>
        <p className="mt-2 text-fg-mute text-xs">
          ↑ テキストの好きな位置をクリック
        </p>
      </div>

      {caretInfo ? (
        <div className="rounded-lg border border-border-base bg-bg-base p-3">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h4 className="font-medium text-fg-base text-sm">結果</h4>
            <Button
              color="gray"
              onClick={handleReset}
              size="sm"
              variant="outlined"
            >
              リセット
            </Button>
          </div>

          <dl className="space-y-1.5 text-xs">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-fg-mute">offset</dt>
              <dd className="font-medium text-fg-base text-sm">
                {caretInfo.offset}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-fg-mute">nodeType</dt>
              <dd className="font-medium text-fg-base">
                {caretInfo.offsetNodeType}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-fg-mute">nodeName</dt>
              <dd className="font-medium text-fg-base">
                {caretInfo.offsetNodeName}
              </dd>
            </div>
            {caretInfo.rectX !== null && (
              <div className="flex flex-wrap items-baseline gap-x-2">
                <dt className="text-fg-mute">rect</dt>
                <dd className="font-medium text-fg-base">
                  ({caretInfo.rectX.toFixed(0)}, {caretInfo.rectY?.toFixed(0)})
                </dd>
              </div>
            )}
          </dl>

          {caretInfo.offsetNodeText && (
            <div className="mt-3 border-border-base border-t pt-3">
              <p className="mb-1 text-fg-mute text-xs">テキスト内の位置:</p>
              <p className="overflow-x-auto rounded bg-bg-mute p-2 font-mono text-fg-base text-xs leading-relaxed">
                {caretInfo.offsetNodeText.slice(0, caretInfo.offset)}
                <span className="bg-primary-bg px-0.5 text-primary-fg">|</span>
                {caretInfo.offsetNodeText.slice(caretInfo.offset)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-fg-mute text-xs">
          クリックするとキャレット情報が表示されます。
        </p>
      )}
    </div>
  );
}
