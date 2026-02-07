import type { FC, PropsWithChildren } from 'react';

type TitlePosition = 'top-left' | 'bottom-right';

export const Playground: FC<
  PropsWithChildren<{
    title?: string;
    titlePosition?: TitlePosition;
  }>
> = ({ title = 'Playground', titlePosition = 'top-left', children }) => {
  return (
    <div className="relative my-8 text-xs sm:text-md">
      <div
        className={`absolute z-10 flex items-center gap-1.5 rounded-sm bg-primary-base px-2.5 py-1 ${
          titlePosition === 'top-left'
            ? '-top-2.5 left-3'
            : 'right-3 -bottom-2.5'
        }`}
      >
        <div className="size-1.5 rotate-45 bg-primary-fg" />
        <span className="font-bold text-primary-fg text-xs tracking-wider">
          {title}
        </span>
      </div>
      <div
        className={`rounded-sm border border-border-base bg-bg-base p-5 ${
          titlePosition === 'top-left' ? 'pt-6' : 'pb-6'
        }`}
      >
        {children}
      </div>
    </div>
  );
};
