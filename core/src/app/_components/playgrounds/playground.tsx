import type { FC, PropsWithChildren } from 'react';

export const Playground: FC<
  PropsWithChildren<{
    title?: string;
  }>
> = ({ title = 'Playground', children }) => {
  return (
    <div className="my-8 text-xs sm:text-md">
      <p className="rounded-t-sm border-border-base border-x border-t bg-bg-mute p-4 font-bold">
        {title}
      </p>
      <div className="rounded-b-sm border border-border-base bg-bg-base p-4">
        {children}
      </div>
    </div>
  );
};
