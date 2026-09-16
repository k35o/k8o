import { ExternalLinkIcon, FlaskIcon } from '@k8ordo/ui';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC, PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  title: string;
  description?: string | undefined;
  href?: string | undefined;
}>;

export const Playground: FC<Props> = ({
  title,
  description,
  href,
  children,
}) => (
  <section className="prose-code vertical:max-w-container-2xl vertical:max-h-app-content vertical:overflow-auto my-10 sm:my-12">
    <div className="writing-h bg-bg-surface dark:bg-bg-subtle rounded-xl p-2">
      <header className="flex flex-col gap-1.5 px-3 pt-2 pb-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-primary-fg bg-primary-bg-subtle inline-flex items-center gap-1 rounded-full py-1 ps-2 pe-2.5 text-xs font-bold">
            <FlaskIcon size="sm" />
            Playground
          </span>
          {/* 狭い画面ではアドレスバーをピルの行に残し、タイトルを次の行に送る */}
          <h3 className="text-fg-base text-md order-2 basis-full font-bold sm:order-1 sm:basis-auto sm:text-lg">
            {title}
          </h3>
          {href !== undefined && (
            <Link
              aria-label={`Playgroundページで開く: ${href}`}
              className="bg-bg-base text-fg-mute hover:text-fg-base order-1 ms-auto inline-flex max-w-full min-w-0 items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-xs transition-colors duration-150 ease-out sm:order-2"
              href={href as Route}
            >
              <span className="truncate sm:hidden">
                {href.split('/').at(-1)}
              </span>
              <span className="hidden truncate sm:inline">{href}</span>
              <span className="inline-flex shrink-0">
                <ExternalLinkIcon size="sm" />
              </span>
            </Link>
          )}
        </div>
        {description !== undefined && (
          <p className="text-fg-mute text-sm leading-relaxed">{description}</p>
        )}
      </header>
      <div className="bg-bg-base rounded-lg p-6 sm:p-8">{children}</div>
    </div>
  </section>
);
