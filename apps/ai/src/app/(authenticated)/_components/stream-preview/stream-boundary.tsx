'use client';

import { Component, type ReactNode } from 'react';

import { StreamLoading } from './stream-loading';

type Props = {
  // 入力（途中コード）が変わるたびに失敗状態をリセットして再描画を試みる鍵。
  resetKey: number;
  children: ReactNode;
};
type State = { failed: boolean; lastKey: number };

// 先行プレビュー全体のエラー境界。途中コードの不正 prop 等で描画が throw しても、
// 島ごと白画面にせずスピナーへフォールバックし、次のトークン（resetKey 変化）で再挑戦する。
export class StreamBoundary extends Component<Props, State> {
  override state: State = { failed: false, lastKey: -1 };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  // resetKey が変わったら失敗状態を解除して再描画を試みる（setState を使わないリセット）。
  static getDerivedStateFromProps(
    props: Props,
    state: State,
  ): Partial<State> | null {
    if (props.resetKey !== state.lastKey) {
      return { failed: false, lastKey: props.resetKey };
    }
    return null;
  }

  override render(): ReactNode {
    return this.state.failed ? <StreamLoading /> : this.props.children;
  }
}
