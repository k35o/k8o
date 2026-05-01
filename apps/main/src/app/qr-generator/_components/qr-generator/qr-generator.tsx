'use client';

import {
  AlertIcon,
  Button,
  Card,
  FormControl,
  Slider,
  TextField,
} from '@k8o/arte-odyssey';
import DomPurify from 'dompurify';
import { type ChangeEvent, useCallback, useMemo, useState } from 'react';
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
      return DomPurify.sanitize(styledSvg, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['svg'],
        ADD_ATTR: ['class', 'viewBox', 'width', 'height'],
      });
    } catch {
      return null;
    }
  }, [text]);

  const handleTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  const handleSizeChange = useCallback((newSize: number) => {
    setSize(newSize);
  }, []);

  const handleDownload = useCallback(() => {
    if (qrCodeSvg === null) {
      return;
    }

    const blob = new Blob([qrCodeSvg], {
      type: 'image/svg+xml',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.svg';
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [qrCodeSvg]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-4 p-5">
          <FormControl
            label="テキスト"
            renderInput={({ labelId: _, ...props }) => (
              <TextField
                onChange={handleTextChange}
                placeholder="QRコードにしたいテキストやURLを入力してください"
                value={text}
                {...props}
              />
            )}
          />
          <FormControl
            label="サイズ調整"
            renderInput={(props) => (
              <Slider
                max={500}
                min={100}
                onChange={handleSizeChange}
                step={10}
                value={size}
                {...props}
              />
            )}
          />
        </div>
      </Card>

      <Card>
        <div className="flex flex-col items-center gap-4 p-5">
          {qrCodeSvg === null ? (
            text.trim() === '' ? (
              <p className="text-fg-mute py-8 text-center">
                QRコードを生成するにはテキストを入力してください
              </p>
            ) : (
              <div className="bg-bg-error text-fg-error flex items-center gap-2 rounded-lg px-4 py-3">
                <AlertIcon size="sm" status="error" />
                <p>QRコードの生成に失敗しました</p>
              </div>
            )
          ) : (
            <>
              <div
                className="flex w-full items-center justify-center overflow-hidden rounded-xl p-4"
                style={{ backgroundColor: 'var(--white)' }}
              >
                <div
                  className="flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                  style={{
                    width: `min(${String(size)}px, 100%)`,
                    height: `min(${String(size)}px, 100%)`,
                    maxWidth: '100vw',
                    maxHeight: '100vh',
                  }}
                />
              </div>
              <Button onClick={handleDownload} variant="contained">
                SVGをダウンロード
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
