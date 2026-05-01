import { PrepareIcon, UpdateDateIcon } from '@k8o/arte-odyssey';
import type { FC, ReactNode } from 'react';

export const ComingSoon: FC<{ description?: ReactNode }> = ({
  description,
}) => (
  <div className="flex flex-col items-center gap-4 p-6">
    <p className="text-2xl font-bold">Coming Soon</p>
    <span className="text-primary-fg">
      <PrepareIcon size="lg" />
    </span>
    <p className="text-fg-mute">
      準備中の機能です。ご利用までもうしばらくお待ちください。
    </p>
    {description}
    <div className="text-fg-mute flex items-center justify-center gap-2">
      <UpdateDateIcon size="sm" />
      <span className="text-fg-mute">近日公開予定</span>
    </div>
  </div>
);
