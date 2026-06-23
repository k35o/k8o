import { DropdownMenu, SendIcon } from '@k8o/arte-odyssey';
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

// 共有操作の presentational 部分（IO は ShareControl コンテナが持つ）。共有アイコン1つに
// まとめ、開いたメニューで公開状態を切り替える（公開する/非公開にする）＋リンクコピー/再公開。
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
      <DropdownMenu.IconTrigger
        icon={<SendIcon />}
        label={isPublic ? '共有（公開中）' : '共有（非公開）'}
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
