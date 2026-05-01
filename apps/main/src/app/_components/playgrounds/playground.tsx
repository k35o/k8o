import { Separator } from '@k8o/arte-odyssey';
import type { FC, PropsWithChildren } from 'react';

export const Playground: FC<
  PropsWithChildren<{
    title: string;
  }>
> = ({ title, children }) => (
  <section className="my-8 sm:my-10">
    <div className="border-border-mute bg-bg-base rounded-xl border p-7 sm:p-10">
      <div className="flex flex-col gap-6 sm:gap-8">
        <header className="flex flex-col gap-2 sm:gap-3">
          <h3 className="text-fg-base text-sm font-bold sm:text-lg">{title}</h3>
          <Separator />
        </header>
        <div>{children}</div>
      </div>
    </div>
  </section>
);
