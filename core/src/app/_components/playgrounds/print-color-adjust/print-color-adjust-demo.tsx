'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { type FC, useEffect, useState } from 'react';

export const PrintColorAdjustDemo: FC = () => {
  const [isExact, setIsExact] = useState(false);

  const handleClick = () => {
    setIsExact(!isExact);
    document.body.style.printColorAdjust = isExact ? 'economy' : 'exact';
  };

  useEffect(() => {
    return () => {
      document.body.style.printColorAdjust = '';
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-bold text-lg md:text-xl">
        色調整の設定（print-color-adjust）
      </p>
      <p className="self-center text-fg-mute text-xs md:text-sm">
        ブラウザの印刷設定で色調整を正確にするか、ブラウザにお任せするかを選択できます。
      </p>
      <p className="self-center text-fg-mute text-xs md:text-sm">
        現在の設定: {isExact ? '正確（exact）' : 'ブラウザにお任せ（economy）'}
      </p>
      <Button onClick={handleClick}>
        {isExact ? 'ブラウザにお任せする' : '正確にする'}
      </Button>
    </div>
  );
};
