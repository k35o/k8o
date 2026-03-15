import Link from 'next/link';
import { SignOutButton } from '@/app/(authenticated)/_components/sign-out-button';
import { ToggleTheme } from '@/app/(authenticated)/_components/toggle-theme';

export const AdminHeader = () => {
  return (
    <header className="border-border-base border-b">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/">
            <span className="font-bold font-noto-sans-jp text-lg tracking-tight">
              k8o
            </span>
            <span className="ml-2 text-fg-mute text-sm">Admin</span>
          </Link>
          <span className="h-5 w-px bg-border-base" />
          <nav className="flex items-center gap-3">
            <Link
              className="text-fg-mute text-sm transition-colors hover:text-fg-base"
              href="/reading-list"
            >
              よんでいるもの
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <SignOutButton />
          <ToggleTheme />
        </div>
      </div>
    </header>
  );
};
