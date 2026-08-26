import { Card, LogoIcon } from '@k8o/arte-odyssey';
import type { FC } from 'react';

import { SignInForm } from './sign-in-form';

export const SignInPage: FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="w-full max-w-sm">
    <Card variant="shadow">
      <div className="flex flex-col items-center gap-8 p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoIcon size="xl" />
          <div className="flex flex-col gap-2">
            <h1 className="font-noto-sans-jp text-2xl font-bold">{title}</h1>
            <p className="text-fg-mute text-sm leading-relaxed">
              {description}
            </p>
            <p className="text-fg-mute text-xs">
              許可されたユーザーのみログインできます
            </p>
          </div>
        </div>
        <SignInForm />
      </div>
    </Card>
  </div>
);
