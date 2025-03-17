import { Button } from '@/components/button';
import { FC } from 'react';

export const Example2: FC = () => {
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
        className="m-auto max-w-1/3 rounded-md p-4 opacity-0 transition-opacity duration-500 backdrop:bg-[#00000080] open:opacity-100 starting:open:opacity-0"
      >
        このポップオーバーはPopover APIによって表示されました。
        ESCキーやこのコンテンツの外側のクリック、toggleまたはhideボタンで閉じられます。
      </p>
    </div>
  );
};
