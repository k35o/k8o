'use client';

import { NavigationGeneration } from '@k8ordo/router';
import { Button, Heading } from '@k8ordo/ui';
import { Component, use } from 'react';
import type { FC, ReactNode } from 'react';

import { reportClientError } from '@/shared/browser/report-client-error';

import styles from './root-error-boundary.module.css';

type Props = { children: ReactNode };

type CatchProps = Props & { generation: number };

type State = { failed: boolean; generation: number };

// ルートレイアウトの部品の失敗は、routes/error.tsx の外で起きる。k8ordo にはそれを受ける
// global-error も root の onUncaughtError の口も無いので、ここで受けて報告する。React の
// error boundary は関数の部品では書けない
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
    reportClientError(
      error instanceof Error ? error : new Error(String(error)),
    );
  }

  override render(): ReactNode {
    if (!this.state.failed) {
      return this.props.children;
    }

    return (
      <div className={styles.root}>
        <title>問題が発生しました | k8o</title>
        <div className={styles.message}>
          <Heading level="h1">問題が発生しました</Heading>
          <p className={styles.description}>
            予期しないエラーが発生しました。再試行しても解決しない場合は、時間をおいて再度お試しください。
          </p>
        </div>
        <Button
          onClick={() => {
            this.setState({ failed: false });
          }}
          size="lg"
        >
          再試行
        </Button>
      </div>
    );
  }
}

export const RootErrorBoundary: FC<Props> = ({ children }) => (
  <Catch generation={use(NavigationGeneration)}>{children}</Catch>
);
