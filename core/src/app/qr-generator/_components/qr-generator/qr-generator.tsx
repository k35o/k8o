'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { RangeField } from '@k8o/arte-odyssey/form/range-field';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import DOMPurify from 'isomorphic-dompurify';
import { useState, useCallback, useMemo, ChangeEvent } from 'react';
import { renderSVG } from 'uqr';

export const QrGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);

  const qrCodeSvg = useMemo(() => {
    if (!text.trim()) return null;

    try {
      const svg = renderSVG(text);
      // Remove any existing width/height attributes and add responsive classes
      const styledSvg = svg.replace(
        /<svg([^>]*)>/,
        '<svg$1 class="w-full h-full max-w-full max-h-full">',
      );
      // Sanitize SVG content to prevent XSS attacks
      return DOMPurify.sanitize(styledSvg, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['svg'],
        ADD_ATTR: ['class', 'viewBox', 'width', 'height'],
      });
    } catch {
      return null;
    }
  }, [text]);

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
          <div className="bg-bg-mute flex w-full max-w-full items-center justify-center overflow-hidden rounded-lg bg-white p-4">
            <div
              dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
              className="flex max-h-full max-w-full items-center justify-center"
              style={{
                width: `min(${String(size)}px, 100%)`,
                height: `min(${String(size)}px, 100%)`,
                maxWidth: '100vw',
                maxHeight: '100vh',
              }}
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
