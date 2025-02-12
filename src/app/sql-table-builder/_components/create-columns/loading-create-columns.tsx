import { FC } from 'react';
import { Button } from '@/components/button';

export const LoadingCreateColumns: FC = () => {
  return (
    <fieldset className="p-2">
      <div className="flex flex-col justify-between gap-2 py-2 md:flex-row md:items-center md:gap-0">
        <legend className="text-lg font-bold">カラム情報</legend>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button>カラムを追加</Button>
        </div>
      </div>
    </fieldset>
  );
};
