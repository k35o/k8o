import { FC, PropsWithChildren } from 'react';

export const Playground: FC<
  PropsWithChildren<{
    title?: string;
  }>
> = ({ title = 'Playground', children }) => {
  return (
    <div className="sm:text-md my-8 text-xs">
      <p className="border-border-base bg-bg-mute rounded-ss-sm rounded-se-sm border-x border-t p-4 font-bold">
        {title}
      </p>
      <div className="bg-bg-base border-border-base rounded-ee-sm rounded-es-sm border p-4">
        {children}
      </div>
    </div>
  );
};
