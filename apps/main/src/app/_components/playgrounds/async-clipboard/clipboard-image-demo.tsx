'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { Select } from '@k8o/arte-odyssey/form/select';
import { useToast } from '@k8o/arte-odyssey/toast';
import Image from 'next/image';
import { type FC, useRef, useState } from 'react';
import arteodysseyIcon from '@/app/_images/arteodyssey.png';
import primaryIcon from '@/app/blog/(articles)/async-clipboard/_images/primary.png';
import k8oIcon from '@/app/icon.png';

const OPTIONS = [
  { value: '1', label: '画像1' },
  { value: '2', label: '画像2' },
] as const;

export const ClipboardImageDemo: FC = () => {
  const ref = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState(primaryIcon.src);
  const { onOpen } = useToast();
  const [selectedSrc, setSelectedSrc] = useState<string>(OPTIONS[0].value);

  const copyText = async () => {
    try {
      if (!ref.current) return;
      const canvas = document.createElement('canvas');
      canvas.width = ref.current.naturalWidth;
      canvas.height = ref.current.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(ref.current, 0, 0);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Blobが取得できませんでした');
          }
          resolve(blob);
        });
      });
      const file = new File([blob], 'k8o.png', { type: 'image/png' });
      const data = [new ClipboardItem({ 'image/png': file })];
      await navigator.clipboard.write(data);
      onOpen('success', 'クリップボードにPNG画像をコピーしました');
    } catch {
      onOpen('error', 'クリップボードにPNG画像をコピーできませんでした');
    }
  };

  const pasteText = async () => {
    const items = await navigator.clipboard.read();

    // 全てのアイテムとタイプの組み合わせを並列で処理
    const results = await Promise.all(
      items.flatMap((item) =>
        item.types
          .filter((type) => type === 'image/png')
          .map(async (type) => {
            const blob = await item.getType(type);
            return URL.createObjectURL(blob);
          }),
      ),
    );

    // 最初に見つかったPNG画像を使用
    const firstResult = results[0];
    if (firstResult) {
      setSrc(firstResult);
      onOpen('success', 'クリップボードにPNG画像を貼り付けました。');
    } else {
      onOpen('error', 'PNG画像が見つかりませんでした。');
    }
  };

  return (
    <div className="flex w-full flex-wrap items-end justify-around gap-4">
      <div className="flex flex-col items-center gap-2">
        <FormControl
          label="画像を選択する"
          renderInput={(props) => (
            <Select
              {...props}
              onChange={(e) => {
                setSelectedSrc(e.currentTarget.value);
              }}
              options={OPTIONS}
              value={selectedSrc}
            />
          )}
        />
        <Image
          alt={`コピーする画像${selectedSrc}`}
          className="rounded-md border border-border-base"
          height={128}
          ref={ref}
          src={selectedSrc === '1' ? k8oIcon : arteodysseyIcon}
          unoptimized
          width={128}
        />
        <Button onClick={() => void copyText()}>PNG画像をコピーする</Button>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full flex-col gap-2">
            <p className="self-start font-bold">ペーストされた画像</p>
            <p className="self-end text-fg-mute text-sm">
              権限があれば、外部でコピーした画像も貼り付けられます
            </p>
          </div>
          <Image
            alt="ペーストされた画像"
            className="rounded-md border border-border-base"
            height={128}
            src={src}
            unoptimized
            width={128}
          />
        </div>
        <Button onClick={() => void pasteText()}>
          保存されたPNG画像を表示する
        </Button>
      </div>
    </div>
  );
};
