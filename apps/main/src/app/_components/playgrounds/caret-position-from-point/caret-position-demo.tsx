'use client';

import { Button } from '@k8ordo/ui';
import { useCallback, useState } from 'react';

import styles from './caret-position-demo.module.css';

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
      <p className={styles.note}>
        このブラウザはこのAPIをサポートしていません。
      </p>
    );
  }

  return (
    <div className={styles.root}>
      {/* caretPositionFromPointはマウス座標を必要とするためキーボードでは使用不可 */}
      <div className={styles.target} onClick={handleClick}>
        <p className={styles.sample}>
          吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。
        </p>
        <p className={styles.hint}>↑ テキストの好きな位置をクリック</p>
      </div>

      {caretInfo ? (
        <div>
          <div className={styles.resultHeader}>
            <h4 className={styles.resultTitle}>結果</h4>
            <Button
              color="base"
              onClick={handleReset}
              size="sm"
              variant="outline"
            >
              リセット
            </Button>
          </div>

          <dl className={styles.fields}>
            <div className={styles.field}>
              <dt className={styles.fieldName}>offset</dt>
              <dd className={styles.offsetValue}>{caretInfo.offset}</dd>
            </div>
            <div className={styles.field}>
              <dt className={styles.fieldName}>nodeType</dt>
              <dd className={styles.fieldValue}>{caretInfo.offsetNodeType}</dd>
            </div>
            <div className={styles.field}>
              <dt className={styles.fieldName}>nodeName</dt>
              <dd className={styles.fieldValue}>{caretInfo.offsetNodeName}</dd>
            </div>
            {caretInfo.rectX !== null && (
              <div className={styles.field}>
                <dt className={styles.fieldName}>rect</dt>
                <dd className={styles.fieldValue}>
                  ({caretInfo.rectX.toFixed(0)}, {caretInfo.rectY?.toFixed(0)})
                </dd>
              </div>
            )}
          </dl>

          {caretInfo.offsetNodeText !== null && (
            <div className={styles.position}>
              <p className={styles.positionLabel}>テキスト内の位置:</p>
              <p className={styles.positionText}>
                {caretInfo.offsetNodeText.slice(0, caretInfo.offset)}
                <span className={styles.caret}>|</span>
                {caretInfo.offsetNodeText.slice(caretInfo.offset)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className={styles.placeholder}>
          クリックするとキャレット情報が表示されます。
        </p>
      )}
    </div>
  );
}
