import { cn } from '@repo/helpers/cn';
import type { FC } from 'react';
import styles from './details-animation-demo.module.css';

export const DetailsAnimationDemo: FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <details
        className={cn(
          'rounded-md border border-border-base p-4',
          styles['detailsAnimation'],
        )}
      >
        <summary className="cursor-pointer font-bold text-fg-base">
          ::details-contentによるアニメーション
        </summary>
        <p>想定した通りにアニメーションが適用されます</p>
      </details>
      <p className="text-fg-mute text-sm">
        例として実装したアニメーションは@prefers-reduced-motionに対応していません。注意してご利用ください。
      </p>
    </div>
  );
};
