'use client';

import { Button, IconButton, Modal } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { useState } from 'react';
import type { FC, ReactNode } from 'react';

import { CodeGroupTransitionContext } from '@/components/site/code-block/code-group';
import { withDemoOrigin } from '@/shared/demo/demo-origin';
import { toDemoTrustedHTML } from '@/shared/demo/demo-trusted-html';

import { DemoResult } from './demo-result';

import styles from './code-demo-view.module.css';

type Props = {
  name: string;
  src: string;
  // コードブロックのメタの allow に書いた、例に渡す権限
  allow?: string | undefined;
  replayIcon: ReactNode;
  expandIcon: ReactNode;
  closeIcon: ReactNode;
  children?: ReactNode;
};

export const CodeDemoView: FC<Props> = ({
  name,
  src,
  allow,
  replayIcon,
  expandIcon,
  closeIcon,
  children,
}) => {
  const [demoDocument, setDemoDocument] = useState<TrustedHTML>();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadDocument = async (): Promise<void> => {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`${src} を読めなかった: ${response.status}`);
    }
    setDemoDocument(
      toDemoTrustedHTML(withDemoOrigin(await response.text(), location.origin)),
    );
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

  // 読めなかった例は、やり直すときに読み直す
  const reloadIfMissing = (): void => {
    if (demoDocument === undefined) void loadDocument();
  };

  const closeDetail = (): void => {
    setIsDetailOpen(false);
  };

  return (
    // コードのすぐ下に結果があるので、タブの切り替えを view transition で描くと、コードの高さが変わる
    // 間に新旧の結果の欄が重なって透ける。モーダルではコードの画像が欄からはみ出して重なる
    <CodeGroupTransitionContext value={false}>
      <div className={styles.root}>
        <div className={cn('writing-h', styles.frame)}>
          <div className="code-annotate-demo-code">{children}</div>
          <DemoResult
            actions={
              <Button
                color="base"
                onClick={() => {
                  setIsDetailOpen(true);
                }}
                size="sm"
                startIcon={expandIcon}
                variant="skeleton"
              >
                広げて見る
              </Button>
            }
            allow={allow}
            demoDocument={demoDocument}
            name={name}
            onReplay={reloadIfMissing}
            ref={observeResult}
            replayIcon={replayIcon}
          />
          <Modal
            aria-label="動く例を広げて表示"
            isOpen={isDetailOpen}
            onClose={closeDetail}
            side="bottom"
          >
            <div className={styles.detailFrame}>
              <div className={styles.detailBar}>
                <IconButton label="閉じる" onClick={closeDetail} size="sm">
                  {closeIcon}
                </IconButton>
              </div>
              {isDetailOpen && (
                <div className={styles.detail}>
                  <div
                    className={cn(
                      'code-annotate-demo-code code-annotate-detail',
                      styles.detailCode,
                    )}
                  >
                    {children}
                  </div>
                  <div className={styles.detailResult}>
                    <DemoResult
                      allow={allow}
                      demoDocument={demoDocument}
                      name={name}
                      onReplay={reloadIfMissing}
                      replayIcon={replayIcon}
                    />
                  </div>
                </div>
              )}
            </div>
          </Modal>
        </div>
      </div>
    </CodeGroupTransitionContext>
  );
};
