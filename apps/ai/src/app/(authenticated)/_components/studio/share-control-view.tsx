import {
  DropdownMenu,
  IconButton,
  LockIcon,
  LockOpenIcon,
  Popover,
  Spinner,
} from '@k8o/arte-odyssey';
import type { FC } from 'react';

type ShareControlViewProps = {
  isPublic: boolean;
  // 公開中だが作業版が公開版より進んでいる（再公開で反映できる）。
  hasDraft: boolean;
  busy: boolean;
  onPublish: () => void;
  onCopy: () => void;
  onUnpublish: () => void;
};

export const ShareControlView: FC<ShareControlViewProps> = ({
  isPublic,
  hasDraft,
  busy,
  onPublish,
  onCopy,
  onUnpublish,
}) => {
  const items: Array<{ label: string; onClick: () => void }> = isPublic
    ? [
        ...(hasDraft
          ? [
              {
                label: busy ? '更新中…' : '変更を反映（再公開）',
                onClick: onPublish,
              },
            ]
          : []),
        { label: 'リンクをコピー', onClick: onCopy },
        { label: '非公開にする', onClick: onUnpublish },
      ]
    : [{ label: busy ? '公開中…' : '公開する', onClick: onPublish }];

  return (
    <DropdownMenu.Root placement="bottom-end">
      {/* IconTrigger は size 固定（md）で他と揃わないため、Popover.Trigger + IconButton を size="sm" で自前展開する。 */}
      <Popover.Trigger
        renderItem={(props) => (
          <IconButton
            color="base"
            label={isPublic ? '共有（公開中）' : '共有（非公開）'}
            size="sm"
            tooltipDisabled
            {...props}
          >
            {busy ? (
              <Spinner label="処理中" size="sm" />
            ) : isPublic ? (
              <LockOpenIcon size="sm" />
            ) : (
              <LockIcon size="sm" />
            )}
          </IconButton>
        )}
      />
      <DropdownMenu.Content>
        {items.map((item, index) => (
          <DropdownMenu.Item
            index={index}
            key={item.label}
            label={item.label}
            onClick={item.onClick}
          />
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
