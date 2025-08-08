'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { SendIcon } from '@k8o/arte-odyssey/icons';
import { useToast } from '@k8o/arte-odyssey/toast';
import { type FC, useActionState, useEffect } from 'react';
import { registerEmail } from './action';

export const MailPanel: FC = () => {
  const [state, action, isPending] = useActionState(registerEmail, null);

  const { onOpen } = useToast();

  useEffect(() => {
    if (state?.success === true) {
      onOpen('success', '登録確認メールを送信しました。');
    }
  }, [state, onOpen]);

  return (
    <div className="flex flex-col justify-center gap-6">
      <form action={action} className="flex flex-col items-center gap-4">
        <FormControl
          errorText={state?.success === false ? state.message : undefined}
          helpText="登録いただいたメールアドレスは、購読のためにのみ使用されます。"
          isDisabled={isPending}
          isInvalid={state?.success === false}
          label="メールアドレス"
          renderInput={({ labelId: _, ...props }) => (
            <TextField name="email" {...props} placeholder="k8o@k8o.me" />
          )}
        />
        <Button
          disabled={isPending}
          fullWidth
          startIcon={<SendIcon size="sm" />}
          type="submit"
        >
          登録
        </Button>
      </form>
    </div>
  );
};
