'use client';

import {
  Alert,
  Button,
  FormControl,
  Radio,
  TextField,
} from '@k8o/arte-odyssey';
import { useActionState, useState } from 'react';

import type { ActionState } from '@/shared/actions/action-state';

type SourceFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
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

type SourceType = (typeof TYPE_OPTIONS)[number]['value'];

const isSourceType = (value: string): value is SourceType =>
  value === 'feed' || value === 'manual';

export const SourceForm = ({ action, defaultValues }: SourceFormProps) => {
  const [state, formAction, isPending] = useActionState(action, {});
  const [type, setType] = useState(defaultValues?.type ?? 'feed');

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error !== undefined && (
        <Alert message={state.error} tone="error" />
      )}
      <FormControl
        label="タイトル"
        required
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            defaultValue={defaultValues?.title ?? ''}
            name="title"
            placeholder="例: Zenn"
            {...props}
          />
        )}
      />
      <FormControl
        label="フィードURL"
        required
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            defaultValue={defaultValues?.url ?? ''}
            name="url"
            placeholder="例: https://zenn.dev/feed"
            {...props}
          />
        )}
      />
      <FormControl
        label="サイトURL"
        required
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            defaultValue={defaultValues?.siteUrl ?? ''}
            name="siteUrl"
            placeholder="例: https://zenn.dev"
            {...props}
          />
        )}
      />
      <FormControl
        label="タイプ"
        required
        renderInput={({ 'aria-labelledby': ariaLabelledby, disabled }) => (
          <Radio
            aria-labelledby={ariaLabelledby}
            disabled={disabled}
            name="type"
            onChange={(value) => {
              if (isSourceType(value)) {
                setType(value);
              }
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
          variant="solid"
        >
          {isPending ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  );
};
