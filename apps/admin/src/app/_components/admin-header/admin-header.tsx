import { ToggleTheme } from '@/app/_components/toggle-theme';

export const AdminHeader = () => {
  return (
    <header className="border-border-base border-b">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="font-bold font-noto-sans-jp text-lg tracking-tight">
            k8o
          </span>
          <span className="h-5 w-px bg-border-base" />
          <span className="text-fg-mute text-sm">Admin</span>
        </div>
        <ToggleTheme />
      </div>
    </header>
  );
};
