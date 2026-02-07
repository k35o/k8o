import type { FC, PropsWithChildren } from 'react';

type TitlePosition = 'top-left' | 'bottom-right';

export const Playground: FC<
  PropsWithChildren<{
    title?: string;
    titlePosition?: TitlePosition;
  }>
> = ({ title = 'Playground', titlePosition = 'top-left', children }) => {
  return (
    <div className="my-8 text-xs sm:text-md">
      <div className="overflow-hidden rounded-sm border border-border-base">
        {titlePosition === 'top-left' && <TitleTag title={title} />}
        <div className="bg-bg-base p-5">{children}</div>
        {titlePosition === 'bottom-right' && <TitleTag title={title} />}
      </div>
    </div>
  );
};

const TitleTag: FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex items-center bg-bg-mute px-4 py-2">
      <div className="flex items-center gap-1.5 rounded-sm bg-primary-base px-2.5 py-0.5">
        <div className="size-1.5 rotate-45 bg-primary-fg" />
        <span className="font-bold text-primary-fg text-xs tracking-wider">
          {title}
        </span>
      </div>
    </div>
  );
};
