'use client';

import { NavigationGeneration } from '@k8ordo/router';
import { Component, use } from 'react';
import type { FC, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  // 失敗したときに出すもの。渡さなければ失敗した部品だけを消し、ページの残りは描き続ける
  fallback?: (reset: () => void) => ReactNode;
  onError?: (error: unknown) => void;
};

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

  override componentDidCatch(error: unknown): void {
    this.props.onError?.(error);
  }

  override render(): ReactNode {
    if (!this.state.failed) {
      return this.props.children;
    }
    return (
      this.props.fallback?.(() => {
        this.setState({ failed: false });
      }) ?? null
    );
  }
}

export const ErrorBoundary: FC<Props> = (props) => (
  <Catch generation={use(NavigationGeneration)} {...props} />
);
