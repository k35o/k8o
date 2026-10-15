'use client';

import { Button, Code } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useRef } from 'react';

import styles from './open-pseudo-demo.module.css';

export function OpenPseudoDemo() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className={styles.root}>
      <style>{`
        .open-demo-target {
          outline: 3px solid transparent;
          outline-offset: 6px;
          transition: outline-color 150ms, background-color 150ms;
        }
        .open-demo-target:open {
          outline-color: var(--color-primary-border);
        }
        /* select / input のピッカーは対象要素の上にUIが被るので、
           親に :has() で背景色を付けて開いていることを別途見せる */
        .open-demo-section:has(:open) {
          background-color: var(--color-primary-bg-subtle);
        }
      `}</style>

      <p className={styles.note}>
        対象要素には共通のスタイルだけ当てています。開いている要素にだけ
        <Code>:open</Code>が当たって枠線が出ます。<Code>select</Code>や
        <Code>input</Code>はピッカーが要素を覆ってしまうので、親セクションに
        <Code>:has(:open)</Code>
        で背景色も付けて開いている状態が見えるようにしています。
      </p>

      <section className={cn('open-demo-section', styles.section)}>
        <h4 className={styles.heading}>details</h4>
        <details className={cn('open-demo-target', styles.details)}>
          <summary className={styles.summary}>クリックして開く</summary>
          <p className={styles.detailsBody}>
            開いている間、<Code>details:open</Code>が当たります。
          </p>
        </details>
      </section>

      <section className={cn('open-demo-section', styles.section)}>
        <h4 className={styles.heading}>dialog</h4>
        <div className={styles.dialogRow}>
          <Button
            onClick={() => {
              dialogRef.current?.showModal();
            }}
          >
            dialog を開く
          </Button>
          <span className={styles.hint}>
            開いている間、<Code>dialog:open</Code>が当たります
          </span>
        </div>
        {/* dialog 自身へのクリック = backdrop クリック扱いで閉じる。ESC キーは dialog 標準で閉じるのでキーボード代替は不要。 */}
        {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
        <dialog
          aria-label=":open デモ用ダイアログ"
          className={cn('open-demo-target', styles.dialog)}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              dialogRef.current?.close();
            }
          }}
          ref={dialogRef}
        >
          <p className={styles.dialogBody}>
            この dialog にも <Code>:open</Code> が当たっています。
          </p>
          <Button
            onClick={() => {
              dialogRef.current?.close();
            }}
          >
            閉じる
          </Button>
        </dialog>
      </section>

      <section className={cn('open-demo-section', styles.section)}>
        <h4 className={styles.heading}>select</h4>
        <select
          aria-label="select :open デモ用の選択肢"
          className={cn('open-demo-target', styles.select)}
          defaultValue="1"
        >
          <option value="1">選択肢 1</option>
          <option value="2">選択肢 2</option>
          <option value="3">選択肢 3</option>
        </select>
        <span className={styles.hint}>
          ピッカーを開いている間だけ<Code>select:open</Code>が当たります。
        </span>
      </section>

      <section className={cn('open-demo-section', styles.section)}>
        <h4 className={styles.heading}>input (color)</h4>
        <input
          aria-label="input :open デモ用のカラーピッカー"
          className={cn('open-demo-target', styles.colorInput)}
          defaultValue="#3b82f6"
          type="color"
        />
        <span className={styles.hint}>
          カラーピッカーを開いている間だけ
          <Code>input[type=&quot;color&quot;]:open</Code>が当たります。
        </span>
      </section>
    </div>
  );
}
