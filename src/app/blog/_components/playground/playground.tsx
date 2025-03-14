import { FC, PropsWithChildren } from 'react';

export const Playground: FC<
  PropsWithChildren<{
    title?: string;
  }>
> = ({ title = 'Playground', children }) => {
  return (
    <div className="sm:text-md my-8 text-xs">
      <p className="border-border-base bg-bg-mute rounded-t-sm border-x border-t p-4 font-bold">
        {title}
      </p>
      <div className="bg-bg-base border-border-base rounded-b-sm border p-4">
        {children}
      </div>
    </div>
  );
};
