import { SignInPage } from '@repo/auth-shell/sign-in-page';

export default function Page() {
  return (
    <SignInPage
      description="このツールの利用にはログインが必要です"
      title="k8o AI"
    />
  );
}
