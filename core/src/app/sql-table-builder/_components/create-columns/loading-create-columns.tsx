import { Button } from '@k8o/components/button';
import { FC } from 'react';

export const LoadingCreateColumns: FC = () => {
  return (
    <fieldset className="p-2">
      <div className="flex flex-col justify-between gap-2 py-2">
        <div className="flex items-center justify-between gap-2">
          <legend className="text-lg font-bold">カラム情報</legend>
          <Button>カラムを追加</Button>
        </div>
        <div className="flex justify-end">
          <div className="w-52 animate-pulse">
            <Button fullWidth variant="outlined">
              &nbsp;
            </Button>
          </div>
        </div>
      </div>
      <div className="bg-bg-mute border-border-base h-96 animate-pulse rounded-md border" />
    </fieldset>
  );
};
