'use client';

import { NavigationGeneration } from '@k8ordo/router';
import { Component, use } from 'react';
import type { FC, ReactNode } from 'react';

type Props = { children: ReactNode };

type CatchProps = Props & { generation: number };

type State = { failed: boolean; generation: number };

// React の error boundary は関数の部品では書けない
class Catch extends Component<CatchProps, State> {
  override state: State = { failed: false, generation: this.props.generation };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  // 失敗は、新しいページの木が画面に出た遷移で解く。パスは木が届く前に替わるので見ない
  static getDerivedStateFromProps(
    props: CatchProps,
    state: State,
  ): Partial<State> | null {
    if (props.generation === state.generation) {
      return null;
    }
    return { failed: false, generation: props.generation };
  }

  override render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

// 失敗した部品だけを消し、ページの残りは描き続ける
export const SilentErrorBoundary: FC<Props> = ({ children }) => (
  <Catch generation={use(NavigationGeneration)}>{children}</Catch>
);
