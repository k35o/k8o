import { Card, LogoIcon } from '@k8o/arte-odyssey';

import { SignInForm } from './_components/sign-in-form';

export default function SignInPage() {
  return (
    <div className="w-full max-w-sm">
      <Card appearance="shadow">
        <div className="flex flex-col items-center gap-8 p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <LogoIcon size="xl" />
            <div className="flex flex-col gap-2">
              <h1 className="font-noto-sans-jp text-2xl font-bold">k8o AI</h1>
              <p className="text-fg-mute text-sm leading-relaxed">
                このツールの利用にはログインが必要です
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
}
