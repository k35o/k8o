import { Separator } from '@k8o/arte-odyssey';
import type { FC, PropsWithChildren } from 'react';

export const Playground: FC<
  PropsWithChildren<{
    title: string;
    description?: string | undefined;
  }>
> = ({ title, description, children }) => (
  <section className="vertical:max-w-container-2xl vertical:max-h-app-content vertical:overflow-auto my-8 sm:my-10">
    <div className="writing-h border-border-mute bg-bg-base rounded-xl border p-7 sm:p-10">
      <div className="flex flex-col gap-6 sm:gap-8">
        <header className="flex flex-col gap-2 sm:gap-3">
          <h3 className="text-fg-base text-sm font-bold sm:text-lg">{title}</h3>
          {description !== undefined && (
            <p className="text-fg-mute text-sm leading-relaxed">
              {description}
            </p>
          )}
          <Separator />
        </header>
        <div>{children}</div>
      </div>
    </div>
  </section>
);
