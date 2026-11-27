'use client';

import { useColorScheme } from '@k8ordo/color-scheme';
import { Button } from '@k8ordo/ui';
import { useState } from 'react';
import type { FC, ReactNode, Ref } from 'react';

import { toDemoAllow } from '@/shared/demo/demo-allow';
import { DEMO_MESSAGE, readDemoFrameMessage } from '@/shared/demo/demo-message';

import styles from './demo-result.module.css';

type Props = {
  name: string;
  allow?: string | undefined;
  demoDocument?: TrustedHTML | undefined;
  replayIcon: ReactNode;
  onReplay: () => void;
  // やり直すの前に並べるボタン
  actions?: ReactNode;
  ref?: Ref<HTMLDivElement>;
};

export const DemoResult: FC<Props> = ({
  name,
  allow,
  demoDocument,
  replayIcon,
  onReplay,
  actions,
  ref,
}) => {
  const { scheme } = useColorScheme();
  const [height, setHeight] = useState<number>();
  const [runCount, setRunCount] = useState(0);

  // 例の文書は iframe の作り直し（やり直し）のたびに替わるので、iframe の要素につなぐ。
  // 配色が替わればつなぎ直して送り直す
  const connectFrame = (frame: HTMLIFrameElement): (() => void) => {
    const sendColorScheme = (): void => {
      frame.contentWindow?.postMessage(
        { type: DEMO_MESSAGE.colorScheme, colorScheme: scheme },
        '*',
      );
    };
    const onMessage = (event: MessageEvent): void => {
      if (event.source !== frame.contentWindow) return;
      const message = readDemoFrameMessage(event.data);
      if (message?.type === DEMO_MESSAGE.ready) {
        sendColorScheme();
      } else if (message?.type === DEMO_MESSAGE.height) {
        setHeight(message.height);
      }
    };
    window.addEventListener('message', onMessage);
    sendColorScheme();
    return () => {
      window.removeEventListener('message', onMessage);
    };
  };

  return (
    <div className={styles.root} ref={ref}>
      <div className={styles.toolbar}>
        <span className={styles.label}>結果</span>
        <div className={styles.actions}>
          {actions}
          <Button
            color="base"
            onClick={() => {
              setRunCount((count) => count + 1);
              onReplay();
            }}
            size="sm"
            startIcon={replayIcon}
            variant="skeleton"
          >
            やり直す
          </Button>
        </div>
      </div>
      <iframe
        allow={toDemoAllow(allow)}
        className={styles.preview}
        key={runCount}
        ref={connectFrame}
        // allow-forms は <form method="dialog"> と submit のイベントのため。送信は例の文書の
        // form-action 'none' が止める。allow-same-origin を足すと、例が記事の origin で動き、
        // 自分の sandbox を外せる
        sandbox="allow-scripts allow-forms"
        // @types/react の srcDoc は文字列だけを受けるが、React は値を変えずに setAttribute に
        // 渡すので、Trusted Types の受け口に TrustedHTML のまま届く
        srcDoc={demoDocument as string | undefined}
        style={height === undefined ? undefined : { blockSize: height }}
        title={`${name} の結果`}
      />
    </div>
  );
};
