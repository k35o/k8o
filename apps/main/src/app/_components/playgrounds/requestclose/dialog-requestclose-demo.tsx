'use client';

import { Button, FormControl, TextField } from '@k8o/arte-odyssey';
import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';

export const DialogRequestCloseDemo: FC = () => {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState('');
  const [logs, setLogs] = useState<Array<{ id: number; message: string }>>([]);
  const logIdRef = useRef(0);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;

    const handleClose = () => {
      const id = logIdRef.current++;
      setLogs((prev) => [
        { id, message: 'ダイアログが閉じられました' },
        ...prev,
      ]);
      setState('');
    };
    const handleCancel = (e: Event) => {
      const id = logIdRef.current++;
      setLogs((prev) => [
        { id, message: 'ダイアログがキャンセルされました' },
        ...prev,
      ]);
      if (stateRef.current !== '') {
        e.preventDefault();
      }
    };

    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('cancel', handleCancel);
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button
        onClick={() => {
          ref.current?.showModal();
        }}
      >
        ダイアログを開く
      </Button>
      {logs.length > 0 && (
        <div className="border-border-base max-h-40 overflow-y-scroll border">
          <ul className="list-disc p-2 pl-6">
            {logs.map((log) => (
              <li className="text-fg-mute" key={log.id}>
                {log.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <dialog
        className="bg-bg-base backdrop:bg-back-drop m-auto max-h-[85dvh] w-5/6 max-w-2xl rounded-lg shadow-md"
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
            renderInput={({ 'aria-labelledby': _, ...props }) => (
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
              variant="outline"
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
