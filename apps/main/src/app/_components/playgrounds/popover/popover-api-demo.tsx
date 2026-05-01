import { Button } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const PopoverApiDemo: FC = () => (
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
      className="backdrop:bg-back-drop m-auto max-w-1/3 rounded-md p-4 opacity-0 transition-opacity duration-500 open:opacity-100 open:starting:opacity-0"
      id="popover1"
      popover="auto"
    >
      このポップオーバーはPopover APIによって表示されました。
      ESCキーやこのコンテンツの外側のクリック、toggleまたはhideボタンで閉じられます。
    </p>
  </div>
);
