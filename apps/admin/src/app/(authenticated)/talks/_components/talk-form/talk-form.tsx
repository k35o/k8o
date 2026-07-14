'use client';

import { Alert, Button, FormControl, Select } from '@k8o/arte-odyssey';
import { useActionState } from 'react';
import type { FC } from 'react';

import { LabeledTextField } from '@/app/(authenticated)/_components';
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
        <Alert message={state.error} tone="error" />
      )}
      <LabeledTextField
        defaultValue={defaultValues?.title ?? ''}
        label="タイトル"
        name="title"
        placeholder="登壇タイトル"
        required
      />
      <LabeledTextField
        defaultValue={defaultValues?.eventName ?? ''}
        label="イベント名"
        name="eventName"
        placeholder="例: Kyoto.js"
        required
      />
      <LabeledTextField
        defaultValue={defaultValues?.eventDate ?? ''}
        label="開催日 (YYYY-MM-DD)"
        name="eventDate"
        placeholder="2025-06-01"
        required
      />
      <LabeledTextField
        defaultValue={defaultValues?.eventLocation ?? ''}
        label="開催地"
        name="eventLocation"
        placeholder="例: 京都 / オンライン"
      />
      <LabeledTextField
        defaultValue={defaultValues?.eventUrl ?? ''}
        label="イベントURL"
        name="eventUrl"
        placeholder="https://example.com/event"
        required
      />
      <LabeledTextField
        defaultValue={defaultValues?.slideUrl ?? ''}
        label="スライドURL"
        name="slideUrl"
        placeholder="https://example.com/slides"
        required
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
          variant="solid"
        >
          {isPending ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  );
};
