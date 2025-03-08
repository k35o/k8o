import { GithubMark } from './github-mark';
import { CheckIcon, ChevronIcon, CloseIcon } from './lucide';
import { Qiita } from './qiita';
import { Twitter } from './twitter';
import { Zenn } from './zenn';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Bell,
  Blend,
  Calendar,
  CircleAlert,
  CircleCheck,
  ClipboardPenLine,
  Clock,
  Contrast,
  Info,
  Link,
  ListMinus,
  PaintBucket,
  Rocket,
  Table2,
  TriangleAlert,
} from 'lucide-react';

const meta: Meta<typeof SVGAElement> = {
  title: 'components/icons',
};

export default meta;
type Story = StoryObj<typeof GithubMark>;

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
          <p className="text-center">ChevronIcon Left</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ChevronIcon direction="up" />
          <p className="text-center">ChevronIcon Up</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ChevronIcon direction="right" />
          <p className="text-center">ChevronIcon Right</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ChevronIcon direction="down" />
          <p className="text-center">ChevronIcon Down</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <CheckIcon />
          <p className="text-center">Check</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Info className="size-24" />
          <p className="text-center">Info</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <CircleCheck className="size-24" />
          <p className="text-center">Success</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <TriangleAlert className="size-24" />
          <p className="text-center">Warning</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <CircleAlert className="size-24" />
          <p className="text-center">Error</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Link className="size-24" />
          <p className="text-center">Link</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ListMinus className="size-24" />
          <p className="text-center">Form</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Table2 className="size-24" />
          <p className="text-center">Table</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ClipboardPenLine className="size-24" />
          <p className="text-center">Copy</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Calendar className="size-24" />
          <p className="text-center">Calendar</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Clock className="size-24" />
          <p className="text-center">Clock</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Blend className="size-24" />
          <p className="text-center">Blend</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Bell className="size-24" />
          <p className="text-center">お知らせ</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <PaintBucket className="size-24" />
          <p className="text-center">色についての情報</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Contrast className="size-24" />
          <p className="text-center">コントラスト</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Rocket className="size-24" />
          <p className="text-center">準備中</p>
        </div>
      </div>
    );
  },
};

export const External: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div>
        <GithubMark className="size-24" />
        <p className="text-center">GitHub Mark</p>
      </div>
      <div>
        <Twitter className="size-24" />
        <p className="text-center">Twitter</p>
      </div>
      <div>
        <Qiita className="size-24" />
        <p className="text-center">qiita</p>
      </div>
      <div>
        <Zenn className="size-24" />
        <p className="text-center">Zenn</p>
      </div>
    </div>
  ),
};
