import { SignInPage } from '@repo/auth-shell/sign-in-page';

export default function Page() {
  return (
    <SignInPage
      description="管理画面へのアクセスにはログインが必要です"
      title="k8o Admin"
    />
  );
}
