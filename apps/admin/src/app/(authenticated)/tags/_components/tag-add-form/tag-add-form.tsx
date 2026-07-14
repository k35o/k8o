'use client';

import { Alert, Button, TextField } from '@k8o/arte-odyssey';
import { useActionState } from 'react';
import type { FC } from 'react';

import { createTag } from '@/features/tags/interface/actions';

export const TagAddForm: FC = () => {
  const [state, formAction, isPending] = useActionState(createTag, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error !== undefined && (
        <Alert message={state.error} tone="error" />
      )}
      <div className="flex items-center gap-3">
        <TextField
          aria-label="タグ名"
          name="name"
          placeholder="新しいタグ名"
          size={28}
        />
        <div className="shrink-0">
          <Button
            color="primary"
            disabled={isPending}
            type="submit"
            variant="solid"
          >
            {isPending ? '追加中...' : '追加'}
          </Button>
        </div>
      </div>
    </form>
  );
};
