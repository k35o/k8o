import type { Meta, StoryObj } from '@storybook/react';
import { GithubMark } from './github-mark';
import { Zenn } from './zenn';
import { Twitter } from './twitter';
import { Qiita } from './qiita';
import {
  ArrowBigRightDash,
  Blend,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  ClipboardPenLine,
  Clock,
  Info,
  Link,
  ListMinus,
  Table2,
  TriangleAlert,
  X,
} from 'lucide-react';

const meta: Meta<typeof SVGAElement> = {
  title: 'components/icons',
};

export default meta;
type Story = StoryObj<typeof GithubMark>;

export const Primary: Story = {
  render: () => {
    return (
      <div className="grid place-items-center gap-4 grid-cols-auto-fit-36">
        <div className="flex flex-col items-center justify-center">
          <X className="size-24" />
          <p className="text-center">Close</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ChevronLeft className="size-24" />
          <p className="text-center">Chevron Left</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ChevronUp className="size-24" />
          <p className="text-center">Chevron Up</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ChevronRight className="size-24" />
          <p className="text-center">Chevron Right</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ChevronDown className="size-24" />
          <p className="text-center">Chevron Down</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <ArrowBigRightDash className="size-24" />
          <p className="text-center">Arrow Big Right Down</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Check className="size-24" />
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
