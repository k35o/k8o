'use client';

import {
  Alert,
  Button,
  FormControl,
  Select,
  Textarea,
} from '@k8o/arte-odyssey';
import { useActionState } from 'react';
import type { FC } from 'react';

import { LabeledTextField } from '@/app/(authenticated)/_components';
import type { ActionState } from '@/shared/actions/action-state';

type SourceOption = { id: number; title: string };

type ArticleFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  sources?: SourceOption[];
  defaultValues?: {
    title: string;
    url: string;
    publishedAt: string;
    description: string | null;
  };
};

export const ArticleForm: FC<ArticleFormProps> = ({
  action,
  sources,
  defaultValues,
}) => {
  const [state, formAction, isPending] = useActionState(action, {});

  const sourceOptions =
    sources === undefined
      ? []
      : [
          { value: '', label: '選択してください' },
          ...sources.map((s) => ({ value: String(s.id), label: s.title })),
        ];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error !== undefined && (
        <Alert message={state.error} tone="error" />
      )}
      {sources !== undefined && (
        <FormControl
          label="ソース"
          required
          renderInput={({ 'aria-labelledby': _, ...props }) => (
            <Select
              {...props}
              defaultValue=""
              name="articleSourceId"
              options={sourceOptions}
            />
          )}
        />
      )}
      <LabeledTextField
        defaultValue={defaultValues?.title ?? ''}
        label="タイトル"
        name="title"
        placeholder="記事タイトル"
        required
      />
      <LabeledTextField
        defaultValue={defaultValues?.url ?? ''}
        label="URL"
        name="url"
        placeholder="https://example.com/article"
        required
      />
      <LabeledTextField
        defaultValue={defaultValues?.publishedAt ?? ''}
        label="公開日 (YYYY-MM-DD)"
        name="publishedAt"
        placeholder="2025-06-01"
        required
      />
      <FormControl
        label="説明"
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <Textarea
            {...props}
            defaultValue={defaultValues?.description ?? ''}
            name="description"
            rows={3}
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
