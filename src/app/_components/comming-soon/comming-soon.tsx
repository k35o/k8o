import { Clock, Rocket } from 'lucide-react';
import { FC } from 'react';

export const CommingSoon: FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <p className="text-2xl font-bold">Comming Soon</p>
      <Rocket className="text-primary-fg size-8" />
      <p className="text-gray-600">
        準備中の機能です。ご利用までもうしばらくお待ちください。
      </p>
      <div className="text-fg-mute flex items-center justify-center gap-2">
        <Clock className="size-4" />
        <span className="text-fg-mute">近日公開予定</span>
      </div>
    </div>
  );
};
