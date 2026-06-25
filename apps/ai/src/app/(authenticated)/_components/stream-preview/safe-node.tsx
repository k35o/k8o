'use client';

import { Component, type ReactNode } from 'react';

import { UnknownChip } from './unknown-chip';

type Props = { name: string; children: ReactNode };
type State = { failed: boolean };

// 1 コンポーネントが prop 不整合などで描画失敗しても、兄弟と全体は描き続けるための境界。
// 途中コードはサブセット外の prop を渡しがちなので、要素単位で握りつぶしてフォールバック表示する。
export class SafeNode extends Component<Props, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override render(): ReactNode {
    if (this.state.failed) {
      return <UnknownChip name={this.props.name} />;
    }
    return this.props.children;
  }
}
