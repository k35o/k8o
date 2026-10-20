'use client';

import { ForkIcon, IconButton, useToast } from '@k8ordo/ui';
import { unstable_rethrow } from 'next/navigation';
import type { FC } from 'react';

export type ArtifactForkAction = (
  artifactId: string,
  version: number,
) => Promise<void>;

type ArtifactForkButtonProps = {
  artifactId: string;
  version: number;
  action: ArtifactForkAction;
};

export const ArtifactForkButton: FC<ArtifactForkButtonProps> = ({
  artifactId,
  version,
  action,
}) => {
  const { open } = useToast();

  const fork = async (): Promise<void> => {
    try {
      await action(artifactId, version);
    } catch (error) {
      // フォークできたときは、action が redirect のエラーで reject される。next/navigation でそれを見分ける手段は unstable_rethrow だけなので、投げ直されたものを受けたときだけ成功を知らせ、移るのは Next に任せる
      try {
        unstable_rethrow(error);
      } catch (redirected) {
        open('success', 'フォークしました');
        throw redirected;
      }
    }
    open('error', 'フォークできませんでした');
  };

  return (
    <IconButton
      color="base"
      label={`版 ${version.toString()} をフォーク`}
      onAction={fork}
      size="sm"
    >
      <ForkIcon size="sm" />
    </IconButton>
  );
};
