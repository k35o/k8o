'use client';

import { FormControl, Select } from '@k8o/arte-odyssey';
import { useEffect, useRef, useState } from 'react';

type ImageRendering = 'auto' | 'smooth' | 'crisp-edges' | 'pixelated';

const PATTERN: ReadonlyArray<readonly number[]> = [
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1],
  [1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const COLORS: Record<number, string> = {
  1: '#f5d166',
  2: '#1a1a1a',
};

export function CrispEdgesDemo() {
  const [value, setValue] = useState<ImageRendering>('crisp-edges');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const [y, row] of PATTERN.entries()) {
      for (const [x, cell] of row.entries()) {
        const color = COLORS[cell];
        if (color === undefined) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    setImageSrc(canvas.toDataURL('image/png'));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <FormControl
        label="image-rendering"
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <Select
            {...props}
            onChange={(e) => {
              setValue(e.target.value as ImageRendering);
            }}
            options={[
              { value: 'auto', label: 'auto (既定)' },
              { value: 'smooth', label: 'smooth' },
              { value: 'crisp-edges', label: 'crisp-edges (Baseline 2026)' },
              { value: 'pixelated', label: 'pixelated' },
            ]}
            value={value}
          />
        )}
      />

      <canvas
        aria-hidden="true"
        className="hidden"
        height={16}
        ref={canvasRef}
        width={16}
      />

      <div className="bg-bg-base flex justify-center rounded-xl p-6 shadow-sm">
        {imageSrc !== null && (
          // oxlint-disable-next-line @next/next/no-img-element -- canvasから生成したdata URLのプレビューでnext/imageは不要
          <img
            alt="16x16のドット絵を16倍に拡大した例"
            height={256}
            src={imageSrc}
            style={{ imageRendering: value }}
            width={256}
          />
        )}
      </div>
    </div>
  );
}
