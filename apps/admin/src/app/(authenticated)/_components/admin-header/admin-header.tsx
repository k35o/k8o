import Link from 'next/link';

import { SignOutButton } from '@/app/(authenticated)/_components/sign-out-button';
import { ToggleTheme } from '@/app/(authenticated)/_components/toggle-theme';

export const AdminHeader = () => (
  <header className="border-border-base border-b">
    <div className="flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-4">
        <Link href="/">
          <span className="font-noto-sans-jp text-lg font-bold tracking-tight">
            k8o
          </span>
          <span className="text-fg-mute ml-2 text-sm">Admin</span>
        </Link>
        <span className="bg-border-base h-5 w-px" />
        <nav className="flex items-center gap-3">
          <Link
            className="text-fg-mute hover:text-fg-base text-sm transition-colors"
            href="/reading-list"
          >
            よんでいるもの
          </Link>
          <Link
            className="text-fg-mute hover:text-fg-base text-sm transition-colors"
            href="/reports"
          >
            レポート
          </Link>
          <Link
            className="text-fg-mute hover:text-fg-base text-sm transition-colors"
            href="/baseline"
          >
            Baseline
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
