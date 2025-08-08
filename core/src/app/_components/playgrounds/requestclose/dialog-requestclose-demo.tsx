'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { type FC, useEffect, useRef, useState } from 'react';

export const DialogRequestCloseDemo: FC = () => {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!ref.current) return;

    const handleClose = () => {
      setLogs((logs) => ['ダイアログが閉じられました', ...logs]);
      setState('');
    };
    const handleCancel = (e: Event) => {
      setLogs((logs) => ['ダイアログがキャンセルされました', ...logs]);
      if (state !== '') {
        e.preventDefault();
      }
    };

    ref.current.addEventListener('close', handleClose);
    ref.current.addEventListener('cancel', handleCancel);

    return () => {
      ref.current?.removeEventListener('close', handleClose);
      ref.current?.removeEventListener('cancel', handleCancel);
    };
  }, [state]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button onClick={() => ref.current?.showModal()}>ダイアログを開く</Button>
      {logs.length > 0 && (
        <div className="max-h-40 overflow-y-scroll border border-border-base">
          <ul className="list-disc p-2 pl-6">
            {logs.map((log, index) => (
              <li className="text-fg-mute" key={log + index.toString()}>
                {log}
              </li>
            ))}
          </ul>
        </div>
      )}
      <dialog
        className="m-auto max-h-lg w-5/6 max-w-2xl rounded-lg border-border-mute bg-bg-base shadow-xl backdrop:bg-back-drop dark:border"
        ref={ref}
      >
        <form
          className="flex flex-col gap-4 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            ref.current?.close();
          }}
        >
          <FormControl
            label="名前"
            renderInput={({ labelId: _, ...props }) => {
              return (
                <TextField
                  {...props}
                  onChange={(e) => {
                    setState(e.target.value);
                  }}
                  value={state}
                />
              );
            }}
          />
          <div className="flex gap-4">
            <Button
              onClick={() => {
                ref.current?.requestClose();
              }}
              variant="outlined"
            >
              閉じる
            </Button>
            <Button type="submit">送信</Button>
          </div>
        </form>
      </dialog>
    </div>
  );
};
