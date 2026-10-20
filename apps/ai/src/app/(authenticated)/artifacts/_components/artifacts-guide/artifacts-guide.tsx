'use client';

import { AssistantIcon, Button, EmptyState, PackageIcon } from '@k8ordo/ui';
import Link from 'next/link';
import type { FC } from 'react';

import { ToolHeader } from '../../../_components/tool-frame';

import styles from './artifacts-guide.module.css';

// スマホでは一覧が Drawer の中にあり本文が空に見えるので、生成物のあるなしで分けずに案内を出す
export const ArtifactsGuide: FC = () => (
  <>
    <ToolHeader>
      <h1 className={styles.title}>作ったもの</h1>
    </ToolHeader>
    <div className={styles.body}>
      <EmptyState
        action={
          <Button
            color="primary"
            renderItem={({ className, children }) => (
              <Link className={className} href="/chat">
                {children}
              </Link>
            )}
            size="sm"
            startIcon={<AssistantIcon size="sm" />}
            variant="solid"
          >
            チャットで作る
          </Button>
        }
        description="一覧から作ったものを選ぶか、チャットで UI やスライドを頼んでください。"
        icon={<PackageIcon size="lg" />}
        title="作ったものを選んでください"
      />
    </div>
  </>
);
