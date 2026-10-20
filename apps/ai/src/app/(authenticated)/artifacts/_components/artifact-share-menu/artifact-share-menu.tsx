'use client';

import {
  Button,
  Dialog,
  DropdownMenu,
  IconButton,
  LockIcon,
  LockOpenIcon,
  Modal,
  Popover,
  Spinner,
  useToast,
} from '@k8ordo/ui';
import { useId, useState, useTransition } from 'react';
import type { FC } from 'react';

import type { ArtifactShare } from '@/features/artifacts/interface/queries';

import styles from './artifact-share-menu.module.css';

export type ArtifactShareActions = {
  publish: (
    artifactId: string,
    version: number,
  ) => Promise<{ slug: string } | null>;
  changeVersion: (
    artifactId: string,
    version: number,
  ) => Promise<'changed' | 'unshared' | 'failed'>;
  unpublish: (artifactId: string) => Promise<boolean>;
};

type ArtifactShareMenuProps = {
  artifactId: string;
  selectedVersion: number;
  share: ArtifactShare | null;
  actions: ArtifactShareActions;
};

const shareUrlOf = (slug: string): string =>
  `${window.location.origin}/s/${slug}`;

// 公開を待ってから写すと押した操作の外になり、Safari などでは写せない。押した操作の中で写し始め、
// クリップボードにはリンクの代わりに、公開が終わるとリンクになる Promise を渡す
const copyPublishedLink = async (
  published: Promise<{ slug: string } | null>,
): Promise<boolean> => {
  const link = published.then((result) => {
    if (result === null) {
      throw new Error('公開できなかったので、写すリンクがありません');
    }
    return new Blob([shareUrlOf(result.slug)], { type: 'text/plain' });
  });
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/plain': link }),
    ]);
    return true;
  } catch {
    return false;
  }
};

export const ArtifactShareMenu: FC<ArtifactShareMenuProps> = ({
  artifactId,
  selectedVersion,
  share,
  actions,
}) => {
  const [busy, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const { open } = useToast();
  const descriptionId = useId();
  const versionLabel = `版 ${selectedVersion.toString()}`;

  const publish = (): void => {
    startTransition(async () => {
      const published = actions
        .publish(artifactId, selectedVersion)
        .catch(() => null);
      const copied = copyPublishedLink(published);
      if ((await published) === null) {
        open('error', '公開に失敗しました');
        return;
      }
      open(
        'success',
        (await copied)
          ? `${versionLabel} を公開しました。リンクをコピーしました`
          : `${versionLabel} を公開しました`,
      );
    });
  };

  const changeVersion = (): void => {
    startTransition(async () => {
      const changed = await actions
        .changeVersion(artifactId, selectedVersion)
        .catch(() => 'failed' as const);
      if (changed === 'changed') {
        open('success', `公開する版を${versionLabel} にしました`);
        return;
      }
      open(
        'error',
        changed === 'unshared'
          ? '公開は取り消されています'
          : '公開する版を変えられませんでした',
      );
    });
  };

  const copyLink = (slug: string): void => {
    navigator.clipboard.writeText(shareUrlOf(slug)).then(
      () => {
        open('success', 'リンクをコピーしました');
      },
      () => {
        open('error', 'リンクをコピーできませんでした');
      },
    );
  };

  const closeConfirm = (): void => {
    setConfirming(false);
  };

  const unpublish = async (): Promise<void> => {
    const unpublished = await actions.unpublish(artifactId).catch(() => false);
    setConfirming(false);
    if (unpublished) {
      open('success', '非公開にしました');
      return;
    }
    open('error', '非公開にできませんでした');
  };

  const items =
    share === null
      ? [{ label: `${versionLabel} を公開する`, onAction: publish }]
      : [
          ...(share.version === selectedVersion
            ? []
            : [
                {
                  label: `公開する版を${versionLabel} にする`,
                  onAction: changeVersion,
                },
              ]),
          {
            label: `版 ${share.version.toString()} のリンクをコピー`,
            onAction: () => {
              copyLink(share.slug);
            },
          },
          {
            label: '非公開にする',
            onAction: () => {
              setConfirming(true);
            },
          },
        ];

  return (
    <>
      <DropdownMenu.Root placement="bottom-end">
        {/* IconTrigger は大きさが md に決まっていて見出しのほかの操作とそろわないので、Popover.Trigger に sm の IconButton を描く。
            IconButton の Tooltip はメニューと同じ要素に anchor-name を書き、メニューの位置がずれるので切る */}
        <Popover.Trigger
          renderItem={(props) => (
            <IconButton
              color="base"
              label={
                share === null
                  ? '共有（非公開）'
                  : `共有（版 ${share.version.toString()} を公開中）`
              }
              size="sm"
              tooltipDisabled
              {...props}
            >
              {busy ? (
                <Spinner label="処理中" size="sm" />
              ) : share === null ? (
                <LockIcon size="sm" />
              ) : (
                <LockOpenIcon size="sm" />
              )}
            </IconButton>
          )}
        />
        <DropdownMenu.Content>
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.label}
              label={item.label}
              onAction={item.onAction}
            />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <Modal
        aria-describedby={descriptionId}
        isOpen={confirming}
        onClose={closeConfirm}
      >
        <Dialog.Root>
          <Dialog.Header onClose={closeConfirm} title="非公開にしますか" />
          <Dialog.Content>
            <div className={styles.confirm}>
              <p className={styles.description} id={descriptionId}>
                今のリンクは使えなくなります。公開し直すと別のリンクになります。
              </p>
              <div className={styles.confirmActions}>
                <Button
                  color="base"
                  onClick={closeConfirm}
                  size="sm"
                  variant="outline"
                >
                  キャンセル
                </Button>
                <Button onAction={unpublish} size="sm">
                  非公開にする
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </Modal>
    </>
  );
};
