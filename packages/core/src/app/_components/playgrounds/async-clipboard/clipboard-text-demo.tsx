'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { type FC, useEffect, useState } from 'react';

export const ClipboardTextDemo: FC = () => {
  const [text, setText] = useState<string>('');
  const [readPermissions, setReadPermissions] = useState<PermissionState>();
  const [writePermissions, setWritePermissions] = useState<PermissionState>();

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
  };

  const pasteText = async () => {
    const text = await navigator.clipboard.readText();
    setText((prev) => prev + text);
  };

  useEffect(() => {
    const readPermission = navigator.permissions.query({
      // @ts-expect-error -- PermissionNameにclipboard-readがない
      name: 'clipboard-read',
    });
    const writePermission = navigator.permissions.query({
      // @ts-expect-error -- PermissionNameにclipboard-writeがない
      name: 'clipboard-write',
    });

    void readPermission
      .then((permission) => {
        setReadPermissions(permission.state);
        permission.onchange = () => {
          setReadPermissions(permission.state);
        };
      })
      .catch(() => {
        console.warn(
          'ClipboardについてのPermission APIをサポートしていないブラウザです。',
        );
      });

    void writePermission
      .then((permission) => {
        setWritePermissions(permission.state);
        permission.onchange = () => {
          setWritePermissions(permission.state);
        };
      })
      .catch(() => {
        console.warn(
          'ClipboardについてのPermission APIをサポートしていないブラウザです。',
        );
      });
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
        isDisabled={false}
        isInvalid={false}
        isRequired={false}
        label="テキスト"
        renderInput={({ labelId: _, ...props }) => (
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
        <Button onClick={() => void copyText()}>クリップボードにコピー</Button>
        <Button onClick={() => void pasteText()}>
          クリップボードからペースト
        </Button>
      </div>
    </div>
  );
};
