'use client';

import { Button, FormControl, TextField } from '@k8o/arte-odyssey';
import { type FC, useEffect, useState } from 'react';

type ClipboardPermissionName = 'clipboard-read' | 'clipboard-write';

const subscribePermission = (
  name: ClipboardPermissionName,
  onChange: (state: PermissionState) => void,
): (() => void) => {
  let status: PermissionStatus | null = null;
  let cancelled = false;
  const handleChange = () => {
    if (status) onChange(status.state);
  };

  navigator.permissions
    .query({ name: name as PermissionName })
    .then((permission) => {
      if (cancelled) return undefined;
      status = permission;
      onChange(permission.state);
      permission.addEventListener('change', handleChange);
      return undefined;
    })
    .catch(() => {
      console.warn(
        'ClipboardについてのPermission APIをサポートしていないブラウザです。',
      );
    });

  return () => {
    cancelled = true;
    status?.removeEventListener('change', handleChange);
  };
};

export const ClipboardTextDemo: FC = () => {
  const [text, setText] = useState('');
  const [readPermissions, setReadPermissions] = useState<PermissionState>();
  const [writePermissions, setWritePermissions] = useState<PermissionState>();

  useEffect(() => {
    const unsubscribeRead = subscribePermission(
      'clipboard-read',
      setReadPermissions,
    );
    const unsubscribeWrite = subscribePermission(
      'clipboard-write',
      setWritePermissions,
    );
    return () => {
      unsubscribeRead();
      unsubscribeWrite();
    };
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
