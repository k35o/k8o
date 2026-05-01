import { SignInForm } from './_components/sign-in-form';

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="font-noto-sans-jp text-2xl font-bold">k8o Admin</h1>
        <p className="text-fg-mute mt-2 text-sm">
          管理画面へのアクセスにはログインが必要です
        </p>
        <p className="text-fg-mute mt-1 text-xs">
          許可されたユーザーのみログインできます
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
