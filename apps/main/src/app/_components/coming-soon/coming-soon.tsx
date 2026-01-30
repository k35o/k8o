import { PrepareIcon, UpdateDateIcon } from '@k8o/arte-odyssey/icons';
import type { FC, ReactNode } from 'react';

export const ComingSoon: FC<{ description?: ReactNode }> = ({
  description,
}) => {
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <p className="font-bold text-2xl">Coming Soon</p>
      <span className="text-primary-fg">
        <PrepareIcon size="lg" />
      </span>
      <p className="text-fg-mute">
        準備中の機能です。ご利用までもうしばらくお待ちください。
      </p>
      {description}
      <div className="flex items-center justify-center gap-2 text-fg-mute">
        <UpdateDateIcon size="sm" />
        <span className="text-fg-mute">近日公開予定</span>
      </div>
    </div>
  );
};
