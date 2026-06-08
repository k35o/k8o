'use client';

import {
  Button,
  Card,
  Dialog,
  Modal,
  TextField,
  Textarea,
  useToast,
} from '@k8o/arte-odyssey';
import { type ChangeEvent, type FC, useState } from 'react';

import {
  type ManualPushActionState,
  sendManualPushAction,
} from '@/features/push-notification/interface/actions';
import { useAsyncAction } from '@/shared/hooks/use-async-action';

export const PushSendForm: FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [open, setOpen] = useState(false);
  const { isPending, run } = useAsyncAction();
  const { onOpen } = useToast();

  const canSend = title.trim() !== '' && body.trim() !== '';

  const handleSend = (): void => {
    run<ManualPushActionState>(
      () => sendManualPushAction({ title, body, url }),
      {
        onError: (message) => {
          onOpen('error', message);
        },
        onSuccess: (res) => {
          setOpen(false);
          onOpen(
            'success',
            `送信しました（成功 ${String(res.succeeded ?? 0)} / 失敗 ${String(res.failed ?? 0)}）`,
          );
          setTitle('');
          setBody('');
          setUrl('');
        },
      },
    );
  };

  return (
    <Card appearance="shadow">
      <div className="flex flex-col gap-4 p-6">
        <p className="text-fg-mute text-sm">
          全購読者へ即時送信します（送信ログには記録されません）。
        </p>
        <TextField
          aria-label="タイトル"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setTitle(e.target.value);
          }}
          placeholder="タイトル"
          size={40}
          value={title}
        />
        <Textarea
          aria-label="本文"
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            setBody(e.target.value);
          }}
          placeholder="本文"
          rows={3}
          value={body}
        />
        <TextField
          aria-label="遷移先URL"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setUrl(e.target.value);
          }}
          placeholder="遷移先URL（省略時は https://k8o.me）"
          size={40}
          value={url}
        />
        <div className="flex justify-end">
          <Button
            color="primary"
            disabled={!canSend || isPending}
            onClick={() => {
              setOpen(true);
            }}
            variant="solid"
          >
            送信する
          </Button>
        </div>
      </div>
      <Modal
        isOpen={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Dialog.Root>
          <Dialog.Header
            onClose={() => {
              setOpen(false);
            }}
            title="プッシュ通知の送信"
          />
          <Dialog.Content>
            <div className="flex flex-col gap-6">
              <p className="text-sm">
                全購読者へ「{title}」を送信します。よろしいですか？
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  color="gray"
                  onClick={() => {
                    setOpen(false);
                  }}
                  variant="outline"
                >
                  キャンセル
                </Button>
                <Button
                  color="primary"
                  disabled={isPending}
                  onClick={handleSend}
                  variant="solid"
                >
                  {isPending ? '送信中...' : '送信する'}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </Modal>
    </Card>
  );
};
