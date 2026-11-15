'use client';

import { useColorScheme } from '@k8ordo/color-scheme';
import { Button } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useState } from 'react';
import type { FC, ReactNode } from 'react';

import { DEMO_MESSAGE, readDemoFrameMessage } from '@/shared/demo/demo-message';

import styles from './code-demo-view.module.css';

type Props = {
  name: string;
  src: string;
  replayIcon: ReactNode;
  children?: ReactNode;
};

export const CodeDemoView: FC<Props> = ({
  name,
  src,
  replayIcon,
  children,
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
    <div className={styles.root}>
      <div className={cn('writing-h', styles.frame)}>
        <div className={styles.layout}>
          <div className={cn('code-annotate-demo-code', styles.code)}>
            {children}
          </div>
          <div className={styles.result}>
            <div className={styles.toolbar}>
              <span className={styles.label}>結果</span>
              <Button
                color="base"
                onClick={() => {
                  setRunCount((count) => count + 1);
                }}
                size="sm"
                startIcon={replayIcon}
                variant="skeleton"
              >
                やり直す
              </Button>
            </div>
            <iframe
              className={styles.preview}
              key={runCount}
              loading="lazy"
              ref={connectFrame}
              sandbox="allow-scripts"
              src={src}
              style={height === undefined ? undefined : { blockSize: height }}
              title={`${name} の結果`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
