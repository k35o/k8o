'use client';

import { Button } from '@/components/button';
import { FormControl } from '@/components/form/form-control';
import { RangeField } from '@/components/form/range-field';
import { TextField } from '@/components/form/text-field';
import { useState, useCallback, useMemo, ChangeEvent } from 'react';
import { renderSVG } from 'uqr';

export const QrGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);

  const qrCodeSvg = useMemo(() => {
    if (!text.trim()) return null;

    try {
      const svg = renderSVG(text);
      // Add size styling to the SVG
      const styledSvg = svg.replace(
        '<svg',
        `<svg style="width: ${String(size)}px; height: ${String(size)}px;"`,
      );
      return styledSvg;
    } catch {
      return null;
    }
  }, [text, size]);

  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
    },
    [],
  );

  const handleSizeChange = useCallback((newSize: number) => {
    setSize(newSize);
  }, []);

  const handleDownload = useCallback(() => {
    if (!qrCodeSvg) {
      return;
    }

    const blob = new Blob([qrCodeSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [qrCodeSvg]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <FormControl
          label="テキスト"
          renderInput={({ labelId: _, ...props }) => (
            <TextField
              value={text}
              onChange={handleTextChange}
              placeholder="QRコードにしたいテキストやURLを入力してください"
              {...props}
            />
          )}
        />

        <FormControl
          label="サイズ調整"
          renderInput={(props) => (
            <RangeField
              value={size}
              onChange={handleSizeChange}
              min={100}
              max={500}
              step={10}
              unit="px"
              {...props}
            />
          )}
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        {qrCodeSvg ? (
          <div className="flex items-center justify-center rounded-lg bg-white p-4 shadow-lg">
            <div
              dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
              className="flex items-center justify-center"
            />
          </div>
        ) : text.trim() ? (
          <div className="bg-bg-error text-fg-error rounded-lg p-4 text-center">
            QRコードの生成に失敗しました
          </div>
        ) : (
          <div className="bg-bg-mute text-fg-base rounded-lg p-8 text-center">
            QRコードを生成するにはテキストを入力してください
          </div>
        )}
        {qrCodeSvg && (
          <Button onClick={handleDownload} variant="contained">
            SVGをダウンロード
          </Button>
        )}
      </div>
    </div>
  );
};
