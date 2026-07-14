'use client';

import { Button, FormControl, TextField } from '@k8o/arte-odyssey';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

type ClipboardPermissionName = 'clipboard-read' | 'clipboard-write';

const subscribePermission = (
  name: ClipboardPermissionName,
  onChange: (state: PermissionState) => void,
): void => {
  navigator.permissions
    .query({ name: name as PermissionName })
    .then((permission) => {
      onChange(permission.state);
      permission.addEventListener('change', () => {
        onChange(permission.state);
      });
      return undefined;
    })
    .catch(() => {
      console.warn(
        'ClipboardについてのPermission APIをサポートしていないブラウザです。',
      );
    });
};

export const ClipboardTextDemo: FC = () => {
  const [text, setText] = useState('');
  const [readPermissions, setReadPermissions] = useState<PermissionState>();
  const [writePermissions, setWritePermissions] = useState<PermissionState>();

  useEffect(() => {
    subscribePermission('clipboard-read', setReadPermissions);
    subscribePermission('clipboard-write', setWritePermissions);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div>
        <p>
          クリップボードの読み取り: {readPermissions ?? '読み込めませんでした'}
        </p>
        <p>
          クリップボードの書き込み: {writePermissions ?? '読み込めませんでした'}
        </p>
      </div>
      <FormControl
        disabled={false}
        invalid={false}
        required={false}
        label="テキスト"
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            onChange={(e) => {
              setText(e.currentTarget.value);
            }}
            value={text}
            {...props}
          />
        )}
      />
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => {
            void navigator.clipboard.writeText(text);
          }}
        >
          クリップボードにコピー
        </Button>
        <Button
          onClick={() => {
            void navigator.clipboard.readText().then((pasted) => {
              setText((prev) => prev + pasted);
              return undefined;
            });
          }}
        >
          クリップボードからペースト
        </Button>
      </div>
    </div>
  );
};
