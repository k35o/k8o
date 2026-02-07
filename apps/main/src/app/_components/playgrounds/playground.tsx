import type { FC, PropsWithChildren } from 'react';

export const Playground: FC<
  PropsWithChildren<{
    title?: string;
  }>
> = ({ title = 'Playground', children }) => {
  return (
    <div className="relative my-8 text-xs sm:text-md">
      <div className="overflow-hidden rounded-sm border border-border-base">
        <div className="flex items-center gap-2.5 bg-primary-base px-4 py-2.5">
          <div className="size-2 rotate-45 bg-primary-fg" />
          <p className="font-bold text-primary-fg tracking-wider">{title}</p>
        </div>
        <div className="border-border-base border-t bg-bg-base p-5">
          {children}
        </div>
      </div>
    </div>
  );
};
