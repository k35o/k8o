'use client';

import { Button, Code } from '@k8o/arte-odyssey';
import { useRef } from 'react';

export function OpenPseudoDemo() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="flex flex-col gap-6">
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

      <p className="text-fg-mute text-sm">
        対象要素には共通のスタイルだけ当てています。開いている要素にだけ
        <Code>:open</Code>が当たって枠線が出ます。<Code>select</Code>や
        <Code>input</Code>はピッカーが要素を覆ってしまうので、親セクションに
        <Code>:has(:open)</Code>
        で背景色も付けて開いている状態が見えるようにしています。
      </p>

      <section className="open-demo-section flex flex-col gap-2 rounded-lg p-3 transition-colors">
        <h4 className="text-fg-base font-bold">details</h4>
        <details className="open-demo-target bg-bg-base rounded-md p-3">
          <summary className="cursor-pointer">クリックして開く</summary>
          <p className="mt-2">
            開いている間、<Code>details:open</Code>が当たります。
          </p>
        </details>
      </section>

      <section className="open-demo-section flex flex-col gap-2 rounded-lg p-3 transition-colors">
        <h4 className="text-fg-base font-bold">dialog</h4>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              dialogRef.current?.showModal();
            }}
          >
            dialog を開く
          </Button>
          <span className="text-fg-mute text-sm">
            開いている間、<Code>dialog:open</Code>が当たります
          </span>
        </div>
        {/* dialog 自身へのクリック = backdrop クリック扱いで閉じる。ESC キーは dialog 標準で閉じるのでキーボード代替は不要。 */}
        {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
        <dialog
          aria-label=":open デモ用ダイアログ"
          className="open-demo-target bg-bg-base inset-0 m-auto size-fit rounded-md p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              dialogRef.current?.close();
            }
          }}
          ref={dialogRef}
        >
          <p className="mb-3">
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

      <section className="open-demo-section flex flex-col gap-2 rounded-lg p-3 transition-colors">
        <h4 className="text-fg-base font-bold">select</h4>
        <select
          aria-label="select :open デモ用の選択肢"
          className="open-demo-target bg-bg-base rounded-md p-2"
          defaultValue="1"
        >
          <option value="1">選択肢 1</option>
          <option value="2">選択肢 2</option>
          <option value="3">選択肢 3</option>
        </select>
        <span className="text-fg-mute text-sm">
          ピッカーを開いている間だけ<Code>select:open</Code>が当たります。
        </span>
      </section>

      <section className="open-demo-section flex flex-col gap-2 rounded-lg p-3 transition-colors">
        <h4 className="text-fg-base font-bold">input (color)</h4>
        <input
          aria-label="input :open デモ用のカラーピッカー"
          className="open-demo-target bg-bg-base h-12 w-24 rounded-md p-1"
          defaultValue="#3b82f6"
          type="color"
        />
        <span className="text-fg-mute text-sm">
          カラーピッカーを開いている間だけ
          <Code>input[type=&quot;color&quot;]:open</Code>が当たります。
        </span>
      </section>
    </div>
  );
}
