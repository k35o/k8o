'use client';

import {
  Alert,
  Button,
  FormControl,
  Select,
  TextField,
} from '@k8o/arte-odyssey';
import { type FC, useActionState } from 'react';

import type { BlogOption } from '@/features/talks/interface/queries';
import type { ActionState } from '@/shared/actions/action-state';

type TalkFormProps = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  blogs: BlogOption[];
  defaultValues?: {
    title: string;
    eventName: string;
    eventDate: string;
    eventLocation: string | null;
    eventUrl: string;
    slideUrl: string;
    blogId: number;
  };
};

export const TalkForm: FC<TalkFormProps> = ({
  action,
  blogs,
  defaultValues,
}) => {
  const [state, formAction, isPending] = useActionState(action, {});

  const blogOptions = [
    { value: '', label: '選択してください' },
    ...blogs.map((b) => ({ value: String(b.id), label: b.slug })),
  ];

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state.error !== undefined && (
        <Alert message={state.error} status="error" />
      )}
      <FormControl
        label="タイトル"
        required
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            {...props}
            defaultValue={defaultValues?.title ?? ''}
            name="title"
            placeholder="登壇タイトル"
          />
        )}
      />
      <FormControl
        label="イベント名"
        required
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            {...props}
            defaultValue={defaultValues?.eventName ?? ''}
            name="eventName"
            placeholder="例: Kyoto.js"
          />
        )}
      />
      <FormControl
        label="開催日 (YYYY-MM-DD)"
        required
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            {...props}
            defaultValue={defaultValues?.eventDate ?? ''}
            name="eventDate"
            placeholder="2025-06-01"
          />
        )}
      />
      <FormControl
        label="開催地"
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            {...props}
            defaultValue={defaultValues?.eventLocation ?? ''}
            name="eventLocation"
            placeholder="例: 京都 / オンライン"
          />
        )}
      />
      <FormControl
        label="イベントURL"
        required
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            {...props}
            defaultValue={defaultValues?.eventUrl ?? ''}
            name="eventUrl"
            placeholder="https://example.com/event"
          />
        )}
      />
      <FormControl
        label="スライドURL"
        required
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <TextField
            {...props}
            defaultValue={defaultValues?.slideUrl ?? ''}
            name="slideUrl"
            placeholder="https://example.com/slides"
          />
        )}
      />
      <FormControl
        label="紐づけるブログ"
        required
        renderInput={({ 'aria-labelledby': _, ...props }) => (
          <Select
            {...props}
            defaultValue={
              defaultValues === undefined ? '' : String(defaultValues.blogId)
            }
            name="blogId"
            options={blogOptions}
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
