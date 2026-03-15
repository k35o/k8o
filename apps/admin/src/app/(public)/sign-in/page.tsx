import { SignInForm } from './_components/sign-in-form';

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="font-bold font-noto-sans-jp text-2xl">k8o Admin</h1>
        <p className="mt-2 text-fg-mute text-sm">
          管理画面へのアクセスにはログインが必要です
        </p>
        <p className="mt-1 text-fg-mute text-xs">
          許可されたユーザーのみログインできます
        </p>
      </div>
      <SignInForm />
    </div>
  );
}
