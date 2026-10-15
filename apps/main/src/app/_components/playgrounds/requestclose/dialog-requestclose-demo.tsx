'use client';

import { Button, FormControl, TextField } from '@k8ordo/ui';
import { useRef, useState } from 'react';
import type { FC, SyntheticEvent } from 'react';

import styles from './dialog-requestclose-demo.module.css';

export const DialogRequestCloseDemo: FC = () => {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState('');
  const [logs, setLogs] = useState<Array<{ id: number; message: string }>>([]);
  const logIdRef = useRef(0);

  const handleClose = () => {
    const id = logIdRef.current++;
    setLogs((prev) => [{ id, message: 'ダイアログが閉じられました' }, ...prev]);
    setState('');
  };
  const handleCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    const id = logIdRef.current++;
    setLogs((prev) => [
      { id, message: 'ダイアログがキャンセルされました' },
      ...prev,
    ]);
    if (state !== '') {
      e.preventDefault();
    }
  };

  return (
    <div className={styles.root}>
      <Button
        onClick={() => {
          ref.current?.showModal();
        }}
      >
        ダイアログを開く
      </Button>
      {logs.length > 0 && (
        <div className={styles.logs}>
          <ul className={styles.logList}>
            {logs.map((log) => (
              <li className={styles.log} key={log.id}>
                {log.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <dialog
        className={styles.dialog}
        onCancel={handleCancel}
        onClose={handleClose}
        ref={ref}
      >
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            ref.current?.close();
          }}
        >
          <FormControl
            label="名前"
            renderInput={({ 'aria-labelledby': _ariaLabelledby, ...props }) => (
              <TextField
                {...props}
                onChange={(e) => {
                  setState(e.target.value);
                }}
                value={state}
              />
            )}
          />
          <div className={styles.actions}>
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
