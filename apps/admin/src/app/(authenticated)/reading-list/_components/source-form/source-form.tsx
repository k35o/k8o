'use client';

import {
  Alert,
  Button,
  FormControl,
  Radio,
  TextField,
} from '@k8o/arte-odyssey';
import { type ChangeEvent, useActionState, useState } from 'react';

type SourceFormProps = {
  action: (
    prev: { error?: string },
    formData: FormData,
  ) => Promise<{ error?: string }>;
  defaultValues?: {
    title: string;
    url: string;
    siteUrl: string;
    type: 'feed' | 'manual';
  };
};

const TYPE_OPTIONS = [
  { value: 'feed', label: 'フィード（自動取得）' },
  { value: 'manual', label: '手動' },
] as const;

export const SourceForm = ({ action, defaultValues }: SourceFormProps) => {
  const [state, formAction, isPending] = useActionState(action, {});
  const [type, setType] = useState(defaultValues?.type ?? 'feed');

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error && <Alert message={state.error} status="error" />}
      <FormControl
        isRequired
        label="タイトル"
        renderInput={({ labelId: _, ...props }) => (
          <TextField
            defaultValue={defaultValues?.title ?? ''}
            name="title"
            placeholder="例: Zenn"
            {...props}
          />
        )}
      />
      <FormControl
        isRequired
        label="フィードURL"
        renderInput={({ labelId: _, ...props }) => (
          <TextField
            defaultValue={defaultValues?.url ?? ''}
            name="url"
            placeholder="例: https://zenn.dev/feed"
            {...props}
          />
        )}
      />
      <FormControl
        isRequired
        label="サイトURL"
        renderInput={({ labelId: _, ...props }) => (
          <TextField
            defaultValue={defaultValues?.siteUrl ?? ''}
            name="siteUrl"
            placeholder="例: https://zenn.dev"
            {...props}
          />
        )}
      />
      <FormControl
        isRequired
        label="タイプ"
        renderInput={({ labelId, isDisabled }) => (
          <Radio
            isDisabled={isDisabled}
            labelId={labelId}
            name="type"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setType(e.target.value as 'feed' | 'manual');
            }}
            options={TYPE_OPTIONS}
            value={type}
          />
        )}
      />
      <div className="flex gap-3">
        <Button
          color="primary"
          disabled={isPending}
          type="submit"
          variant="contained"
        >
          {isPending ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  );
};
