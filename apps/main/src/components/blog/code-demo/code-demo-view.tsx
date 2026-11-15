'use client';

import { useColorScheme } from '@k8ordo/color-scheme';
import { Button } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useState } from 'react';
import type { FC, ReactNode } from 'react';

import { DEMO_MESSAGE, readDemoFrameMessage } from '@/shared/demo/demo-message';
import { toDemoTrustedHTML } from '@/shared/demo/demo-trusted-html';

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
  const [demoDocument, setDemoDocument] = useState<TrustedHTML>();
  const [height, setHeight] = useState<number>();
  const [runCount, setRunCount] = useState(0);

  const loadDocument = async (): Promise<void> => {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`${src} を読めなかった: ${response.status}`);
    }
    setDemoDocument(toDemoTrustedHTML(await response.text()));
  };

  // 例の文書は、結果の欄が画面に近づいてから読む
  const observeResult = (result: HTMLDivElement): (() => void) | undefined => {
    if (demoDocument !== undefined) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some(({ isIntersecting }) => isIntersecting)) return;
        observer.disconnect();
        void loadDocument();
      },
      { rootMargin: '100%' },
    );
    observer.observe(result);
    return () => {
      observer.disconnect();
    };
  };

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
          <div className={styles.result} ref={observeResult}>
            <div className={styles.toolbar}>
              <span className={styles.label}>結果</span>
              <Button
                color="base"
                onClick={() => {
                  setRunCount((count) => count + 1);
                  // 読めなかった例は、やり直すときに読み直す
                  if (demoDocument === undefined) void loadDocument();
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
              ref={connectFrame}
              sandbox="allow-scripts"
              // @types/react の srcDoc は文字列だけを受けるが、React は値を変えずに setAttribute に
              // 渡すので、Trusted Types の受け口に TrustedHTML のまま届く
              srcDoc={demoDocument as string | undefined}
              style={height === undefined ? undefined : { blockSize: height }}
              title={`${name} の結果`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
