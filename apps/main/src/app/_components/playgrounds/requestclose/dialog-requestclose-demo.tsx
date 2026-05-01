'use client';

import { Button, FormControl, TextField } from '@k8o/arte-odyssey';
import { type FC, useEffect, useRef, useState } from 'react';

export const DialogRequestCloseDemo: FC = () => {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

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

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('cancel', handleCancel);

    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, [state]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button onClick={() => ref.current?.showModal()}>ダイアログを開く</Button>
      {logs.length > 0 && (
        <div className="border-border-base max-h-40 overflow-y-scroll border">
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
        className="max-h-lg bg-bg-base backdrop:bg-back-drop m-auto w-5/6 max-w-2xl rounded-lg shadow-md"
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
            renderInput={({ labelId: _, ...props }) => (
              <TextField
                {...props}
                onChange={(e) => {
                  setState(e.target.value);
                }}
                value={state}
              />
            )}
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
