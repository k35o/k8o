import { Button } from '@/components/button';
import { FC } from 'react';

export const PopoverApiDemo: FC = () => {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button popoverTarget="popover1" popoverTargetAction="toggle">
          popovertargetaction: toggle
        </Button>
        <Button popoverTarget="popover1" popoverTargetAction="show">
          popovertargetaction: show
        </Button>
        <Button popoverTarget="popover1" popoverTargetAction="hide">
          popovertargetaction: hide
        </Button>
      </div>
      <p
        id="popover1"
        popover="auto"
        className="max-w-1/3 starting:open:opacity-0 m-auto rounded-md p-4 opacity-0 transition-opacity duration-500 backdrop:bg-[#00000080] open:opacity-100"
      >
        このポップオーバーはPopover APIによって表示されました。
        ESCキーやこのコンテンツの外側のクリック、toggleまたはhideボタンで閉じられます。
      </p>
    </div>
  );
};
