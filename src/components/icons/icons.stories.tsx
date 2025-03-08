import { ArteOdyssey } from './arte-odyssey';
import { GitHubIcon } from './github-mark';
import {
  AlertIcon,
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  ColorContrastIcon,
  ColorInfoIcon,
  CopyIcon,
  DarkModeIcon,
  FormIcon,
  HistoryIcon,
  LightModeIcon,
  LinkIcon,
  ListIcon,
  MailIcon,
  MinusIcon,
  MixedColorIcon,
  NewsIcon,
  PlusIcon,
  PrepareIcon,
  PublishDateIcon,
  RSSIcon,
  SendIcon,
  TableIcon,
  UpdateDateIcon,
  ViewIcon,
} from './lucide';
import { QiitaIcon } from './qiita';
import { TwitterIcon } from './twitter';
import { ZennIcon } from './zenn';
import type { Meta, StoryObj } from '@storybook/react';
import { FC } from 'react';

const meta: Meta<typeof SVGAElement> = {
  title: 'components/icons',
};

export default meta;
type Story = StoryObj<FC>;

export const Primary: Story = {
  render: () => {
    return (
      <div className="grid-cols-auto-fit-36 grid place-items-center gap-4">
        <div className="flex flex-col items-center justify-center">
          <CloseIcon />
          <p className="text-center">Close</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ChevronIcon direction="left" />
          <p className="text-center">Chevron Left</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ChevronIcon direction="up" />
          <p className="text-center">Chevron Up</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ChevronIcon direction="right" />
          <p className="text-center">Chevron Right</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ChevronIcon direction="down" />
          <p className="text-center">Chevron Down</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <CheckIcon />
          <p className="text-center">Check</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <AlertIcon status="info" />
          <p className="text-center">Info</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <AlertIcon status="success" />
          <p className="text-center">Success</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <AlertIcon status="warning" />
          <p className="text-center">Warning</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <AlertIcon status="error" />
          <p className="text-center">Error</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <LinkIcon />
          <p className="text-center">Link</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <FormIcon />
          <p className="text-center">Form</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <TableIcon />
          <p className="text-center">Table</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ListIcon />
          <p className="text-center">List</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <CopyIcon />
          <p className="text-center">Copy</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <PublishDateIcon />
          <p className="text-center">公開日時</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <UpdateDateIcon />
          <p className="text-center">更新日時</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <SendIcon />
          <p className="text-center">送信</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <HistoryIcon />
          <p className="text-center">履歴</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <MailIcon />
          <p className="text-center">メール</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <PlusIcon />
          <p className="text-center">プラス</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <MinusIcon />
          <p className="text-center">マイナス</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <LightModeIcon />
          <p className="text-center">ライトモード</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <DarkModeIcon />
          <p className="text-center">ダークモード</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ViewIcon />
          <p className="text-center">閲覧数</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <NewsIcon />
          <p className="text-center">お知らせ</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ColorInfoIcon />
          <p className="text-center">色についての情報</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ColorContrastIcon />
          <p className="text-center">コントラスト</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <MixedColorIcon />
          <p className="text-center">混ざり合った色</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <PrepareIcon />
          <p className="text-center">準備中</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <RSSIcon />
          <p className="text-center">RSS</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <GitHubIcon />
          <p className="text-center">GitHub</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <TwitterIcon />
          <p className="text-center">Twitter</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <QiitaIcon />
          <p className="text-center">Qiita</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ZennIcon />
          <p className="text-center">Zenn</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ArteOdyssey className="size-8" />
          <p className="text-center">Arte Odyssey</p>
        </div>
      </div>
    );
  },
};
