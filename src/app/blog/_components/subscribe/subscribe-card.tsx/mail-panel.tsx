'use client';

import { registerEmail } from './action';
import { Button } from '@/components/button';
import { FormControl } from '@/components/form/form-control';
import { TextField } from '@/components/form/text-field';
import { SendIcon } from '@/components/icons';
import { useToast } from '@/components/toast';
import { FC, useActionState, useEffect } from 'react';

export const MailPanel: FC = () => {
  const [state, action, isPending] = useActionState(
    registerEmail,
    null,
  );

  const { onOpen } = useToast();

  useEffect(() => {
    if (state?.success === true) {
      onOpen('success', '登録確認メールを送信しました。');
    }
  }, [state]);

  return (
    <div className="flex flex-col justify-center gap-6">
      <form className="flex items-center gap-4" action={action}>
        <FormControl
          label="メールアドレス"
          helpText="登録いただいたメールアドレスは、購読のためにのみ使用されます。"
          isInvalid={state?.success === false}
          isDisabled={isPending}
          errorText={state?.success ? state.message : undefined}
          renderInput={({ labelId: _, ...props }) => (
            <TextField
              name="email"
              {...props}
              placeholder="k8o@k8o.me"
            />
          )}
        />
        <div className="h-fit shrink-0">
          <Button
            type="submit"
            startIcon={<SendIcon size="sm" />}
            disabled={isPending}
          >
            登録
          </Button>
        </div>
      </form>
    </div>
  );
};
