'use client';

import { Button, FormControl, Select, useToast } from '@k8ordo/ui';
import Image from 'next/image';
import { useRef, useState } from 'react';
import type { FC } from 'react';

import primaryIcon from '@/app/blog/(articles)/async-clipboard/_images/primary.png';
import k8oIcon from '@/app/icon.png';

import styles from './clipboard-image-demo.module.css';

const OPTIONS = [
  { value: '1', label: '画像1' },
  { value: '2', label: '画像2' },
] as const;

export const ClipboardImageDemo: FC = () => {
  const ref = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState(primaryIcon.src);
  const { open } = useToast();
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
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((createdBlob) => {
          // toBlobのコールバックは非同期に呼ばれるため、throwしてもrejectにならず永久にpendingする
          if (!createdBlob) {
            reject(new Error('Blobが取得できませんでした'));
            return;
          }
          resolve(createdBlob);
        });
      });
      const file = new File([blob], 'k8o.png', { type: 'image/png' });
      const data = [new ClipboardItem({ 'image/png': file })];
      await navigator.clipboard.write(data);
      open('success', 'クリップボードにPNG画像をコピーしました');
    } catch {
      open('error', 'クリップボードにPNG画像をコピーできませんでした');
    }
  };

  const pasteText = async () => {
    try {
      const items = await navigator.clipboard.read();

      const blobs = await Promise.all(
        items.flatMap((item) =>
          item.types
            .filter((type) => type === 'image/png')
            .map((type) => item.getType(type)),
        ),
      );

      const firstBlob = blobs[0];
      if (firstBlob === undefined) {
        open('error', 'PNG画像が見つかりませんでした。');
        return;
      }
      if (src.startsWith('blob:')) {
        URL.revokeObjectURL(src);
      }
      setSrc(URL.createObjectURL(firstBlob));
      open('success', 'クリップボードにPNG画像を貼り付けました。');
    } catch {
      open('error', 'クリップボードからPNG画像を読み取れませんでした。');
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.column}>
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
          className={styles.image}
          height={128}
          ref={ref}
          src={selectedSrc === '1' ? k8oIcon : primaryIcon}
          unoptimized
          width={128}
        />
        <Button onClick={() => void copyText()}>PNG画像をコピーする</Button>
      </div>
      <div className={styles.column}>
        <div className={styles.pasted}>
          <div className={styles.pastedHeader}>
            <p className={styles.pastedTitle}>ペーストされた画像</p>
            <p className={styles.pastedNote}>
              権限があれば、外部でコピーした画像も貼り付けられます
            </p>
          </div>
          <Image
            alt="ペーストされた画像"
            className={styles.image}
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
