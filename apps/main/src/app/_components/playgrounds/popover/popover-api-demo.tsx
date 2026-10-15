import { Button } from '@k8ordo/ui';
import type { FC } from 'react';

import styles from './popover-api-demo.module.css';

export const PopoverApiDemo: FC = () => (
  <div>
    <div className={styles.actions}>
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
    <p className={styles.popover} id="popover1" popover="auto">
      このポップオーバーはPopover APIによって表示されました。
      ESCキーやこのコンテンツの外側のクリック、toggleまたはhideボタンで閉じられます。
    </p>
  </div>
);
