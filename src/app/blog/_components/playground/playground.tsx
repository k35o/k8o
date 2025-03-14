import { FC, PropsWithChildren } from 'react';

export const Playground: FC<
  PropsWithChildren<{
    title?: string;
  }>
> = ({ title = 'Playground', children }) => {
  return (
    <div className="border-border-base my-8 rounded-md border">
      <p className="bg-bg-mute rounded-t-sm p-4">{title}</p>
      <div className="p-4">{children}</div>
    </div>
  );
};
