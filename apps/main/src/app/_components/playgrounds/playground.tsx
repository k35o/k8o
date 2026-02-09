import { Separator } from '@k8o/arte-odyssey/separator';
import type { FC, PropsWithChildren } from 'react';

export const Playground: FC<
  PropsWithChildren<{
    title: string;
  }>
> = ({ title, children }) => {
  return (
    <section className="my-8 sm:my-10">
      <div className="rounded-md border border-border-base bg-bg-base p-7 sm:p-10">
        <div className="flex flex-col gap-6 sm:gap-8">
          <header className="flex flex-col gap-2 sm:gap-3">
            <h3 className="font-bold text-fg-base text-sm sm:text-lg">
              {title}
            </h3>
            <Separator />
          </header>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
};
