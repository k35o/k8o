'use client';

import { Button } from '@k8o/arte-odyssey';
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
      <div className="bg-bg-mute rounded-xl p-3">
        <p className="text-fg-mute text-sm">
          このブラウザはこのAPIをサポートしていません。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* caretPositionFromPointデモ用のクリックエリア */}
      {/* caretPositionFromPointデモ用のクリックエリア */}
      {/* caretPositionFromPointはマウス座標を必要とするためキーボードでは使用不可 */}
      <div
        className="bg-bg-base cursor-text rounded-xl p-3 shadow-sm select-none"
        onClick={handleClick}
      >
        <p className="text-fg-base text-sm leading-relaxed">
          吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。
        </p>
        <p className="text-fg-mute mt-2 text-xs">
          ↑ テキストの好きな位置をクリック
        </p>
      </div>

      {caretInfo ? (
        <div className="bg-bg-base rounded-xl p-3 shadow-sm">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h4 className="text-fg-base text-sm font-medium">結果</h4>
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
              <dd className="text-fg-base text-sm font-medium">
                {caretInfo.offset}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-fg-mute">nodeType</dt>
              <dd className="text-fg-base font-medium">
                {caretInfo.offsetNodeType}
              </dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-fg-mute">nodeName</dt>
              <dd className="text-fg-base font-medium">
                {caretInfo.offsetNodeName}
              </dd>
            </div>
            {caretInfo.rectX !== null && (
              <div className="flex flex-wrap items-baseline gap-x-2">
                <dt className="text-fg-mute">rect</dt>
                <dd className="text-fg-base font-medium">
                  ({caretInfo.rectX.toFixed(0)}, {caretInfo.rectY?.toFixed(0)})
                </dd>
              </div>
            )}
          </dl>

          {caretInfo.offsetNodeText && (
            <div className="border-border-base mt-3 border-t pt-3">
              <p className="text-fg-mute mb-1 text-xs">テキスト内の位置:</p>
              <p className="bg-bg-mute text-fg-base overflow-x-auto rounded p-2 font-mono text-xs leading-relaxed">
                {caretInfo.offsetNodeText.slice(0, caretInfo.offset)}
                <span className="bg-primary-bg text-primary-fg px-0.5">|</span>
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
