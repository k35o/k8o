import { Anchor } from '@k8o/arte-odyssey/anchor';
import { Code } from '@k8o/arte-odyssey/code';
import { LinkIcon } from '@k8o/arte-odyssey/icons';
import { isInternalRoute } from '@k8o/helpers';
import { cn } from '@k8o/helpers/cn';
import type { MDXComponents } from 'mdx/types';
import type { Route } from 'next';
import Link from 'next/link';
import type { FC, PropsWithChildren } from 'react';

const LinkHeading: FC<
  PropsWithChildren<{
    type: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }>
> = ({ type, children }) => {
  const Comp = type;

  const isStringChildren = typeof children === 'string';

  return (
    <Comp
      className={cn(
        'group my-4 font-bold',
        type === 'h2' && 'mb-4 text-xl sm:text-2xl',
        type === 'h3' && 'text-xl sm:text-2xl',
        type === 'h4' && 'text-lg sm:text-xl',
        type === 'h5' && 'text-md sm:text-lg',
        type === 'h6' && 'text-sm sm:text-md',
      )}
      id={isStringChildren ? children : undefined}
    >
      {isStringChildren && (
        <a
          className="relative"
          href={`#${encodeURIComponent(children)}`}
          tabIndex={-1}
        >
          <span
            className={cn(
              'absolute top-1 box-content text-fg-mute opacity-0 transition-opacity duration-500 sm:group-hover:opacity-100',
              type === 'h2' && '-left-7 top-1.5 pr-2',
              type === 'h3' && '-left-7 pr-2',
              type === 'h4' && '-left-5 top-2 pr-2',
              type === 'h5' && '-left-5 top-1.5 pr-2',
              type === 'h6' && '-left-5 pr-2',
            )}
          >
            <LinkIcon size={['h2', 'h3'].includes(type) ? 'md' : 'sm'} />
          </span>
        </a>
      )}
      {children}
    </Comp>
  );
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: () => null,
    h2: ({ children }) => <LinkHeading type="h3">{children}</LinkHeading>,
    h3: ({ children }) => <LinkHeading type="h4">{children}</LinkHeading>,
    h4: ({ children }) => <LinkHeading type="h5">{children}</LinkHeading>,
    h5: ({ children }) => <LinkHeading type="h6">{children}</LinkHeading>,
    a: ({ href, children }: PropsWithChildren<{ href: string }>) => (
      <>
        {href ? (
          isInternalRoute<Route>(href) ? (
            <Anchor
              href={href}
              renderAnchor={(props) => <Link {...props} href={href} />}
            >
              {children}
            </Anchor>
          ) : (
            <Anchor href={href} renderAnchor={(props) => <a {...props} />}>
              {children}
            </Anchor>
          )
        ) : (
          <p>{children}</p>
        )}
      </>
    ),
    p: ({ children }) => (
      <p className="my-2 text-xs leading-normal sm:text-md">{children}</p>
    ),
    code: ({ children, ...props }) => {
      if (typeof children === 'string') {
        return <Code>{children}</Code>;
      }
      return (
        <code {...props} className="text-xs sm:text-md">
          {children}
        </code>
      );
    },
    pre: ({ children, ...rest }) => {
      return (
        <pre
          {...rest}
          className="my-4 overflow-x-auto rounded-lg px-2 py-1 sm:p-4"
        >
          {children}
        </pre>
      );
    },
    li: ({ children }) => (
      <li className="list-inside list-disc text-xs sm:text-md">{children}</li>
    ),
    ul: ({ children }) => <ul className="text-xs sm:text-md">{children}</ul>,
    blockquote: ({ children }) => (
      <figure className="my-4 rounded-lg bg-bg-mute p-2 pl-3">
        <blockquote className="border-border-base border-l-3 pl-2 text-fg-mute text-sm">
          {children}
        </blockquote>
      </figure>
    ),
    ...components,
  };
}
