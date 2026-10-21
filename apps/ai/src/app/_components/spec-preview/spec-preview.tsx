'use client';

import type { Spec } from '@json-render/core';
import { JsonRenderUI } from '@k8ordo/ui/json-render/registry';
import { useSyncExternalStore } from 'react';
import type { FC, MouseEvent } from 'react';

import styles from './spec-preview.module.css';

type SpecPreviewProps = {
  spec: Spec | null;
  loading?: boolean;
};

// 生成 UI のリンクとフォームでは、どの面でも移動させない。リンクの URL に載せた中身は押した人から外へ送られ、
// 公開ページでは中身に利害の無い閲覧者が押すので、押す前の確かめが効かないため。持ち主の面でも、画面ごと移動すると
// 会話の受信が切れ、生成物のページでも見ていた版から離れる。伝播は止めないので、生成 UI 側のハンドラはそのまま動く
const preventLinkNavigation = (event: MouseEvent): void => {
  if (
    event.target instanceof Element &&
    event.target.closest('a[href]') !== null
  ) {
    event.preventDefault();
  }
};

// 中クリックは click を出さず、auxclick の既定の動きで新しいタブを開く
const preventMiddleClickNavigation = (event: MouseEvent): void => {
  if (event.button === 1) {
    preventLinkNavigation(event);
  }
};

const subscribeNothing = (): (() => void) => () => {};

// 生成された spec を @k8ordo/ui の registry でその場に描画する。
// Sandbox 時代の iframe と違い同一ドキュメントなので、テーマ・フォントは
// アプリのものをそのまま継承する。空状態の分岐は呼び出し側が持つ。
export const SpecPreview: FC<SpecPreviewProps> = ({
  spec,
  loading = false,
}) => {
  // 止める処理は React のハンドラなので、サーバーで描いた HTML ではハイドレーションまで動かない。
  // そのあいだはリンクとフォームを押すこともフォーカスすることもできないよう、根を inert にする
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  return (
    <div
      className={styles.root}
      inert={!hydrated}
      onAuxClickCapture={preventMiddleClickNavigation}
      onClickCapture={preventLinkNavigation}
      onSubmitCapture={(event) => {
        event.preventDefault();
      }}
    >
      <div className={styles.canvas}>
        <JsonRenderUI loading={loading} spec={spec} />
      </div>
    </div>
  );
};
