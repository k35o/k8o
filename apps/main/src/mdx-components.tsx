import { Anchor, Code, LinkIcon } from '@k8o/arte-odyssey';
import { cn } from '@repo/helpers/cn';
import { isInternalRoute } from '@repo/helpers/is-internal-route';
import type { MDXComponents } from 'mdx/types';
import type { Route } from 'next';
import Link from 'next/link';
import { isValidElement } from 'react';
import type { FC, PropsWithChildren, ReactNode } from 'react';

import { BrowserSupportStatus } from '@/app/_components/browser-support-status/browser-support-status';
import { CodeBlock } from '@/app/_components/code-block';

// インラインコード等を含む見出しからidに使う全文を取り出す。
// shared/mdx/toc-tree.ts の phrasingText と同じ結果になる必要がある
const isReactNodeArray = (value: ReactNode): value is readonly ReactNode[] =>
  Array.isArray(value);

const extractText = (children: ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return children.toString();
  if (isReactNodeArray(children)) {
    return children.map((child) => extractText(child)).join('');
  }
  if (isValidElement<PropsWithChildren>(children)) {
    return extractText(children.props.children);
  }
  return '';
};

const LinkHeading: FC<
  PropsWithChildren<{
    type: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }>
> = ({ type, children }) => {
  const Comp = type;

  const text = extractText(children);
  const hasText = text !== '';

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
      id={hasText ? text : undefined}
    >
      {hasText && (
        <a
          className="relative"
          href={`#${encodeURIComponent(text)}`}
          tabIndex={-1}
        >
          <span
            className={cn(
              'absolute top-1 box-content text-fg-mute opacity-0 transition-opacity duration-500 sm:group-hover:opacity-100',
              type === 'h2' &&
                'top-1.5 -inset-s-7 pe-2 vertical:-top-7 vertical:right-auto vertical:left-1.5 vertical:pe-0',
              type === 'h3' &&
                '-inset-s-7 pe-2 vertical:-top-7 vertical:right-auto vertical:left-1.5 vertical:pe-0',
              type === 'h4' &&
                'top-2 -inset-s-5 pe-2 vertical:-top-5 vertical:right-auto vertical:left-1.5 vertical:pe-0',
              type === 'h5' &&
                'top-1.5 -inset-s-5 pe-2 vertical:-top-5 vertical:right-auto vertical:left-1.5 vertical:pe-0',
              type === 'h6' &&
                '-inset-s-5 pe-2 vertical:-top-5 vertical:right-auto vertical:left-1.5 vertical:pe-0',
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
    BrowserSupportStatus,
    h1: () => null,
    h2: ({ children }) => <LinkHeading type="h3">{children}</LinkHeading>,
    h3: ({ children }) => <LinkHeading type="h4">{children}</LinkHeading>,
    h4: ({ children }) => <LinkHeading type="h5">{children}</LinkHeading>,
    h5: ({ children }) => <LinkHeading type="h6">{children}</LinkHeading>,
    a: ({ href, children }: PropsWithChildren<{ href: string }>) =>
      href ? (
        isInternalRoute(href) ? (
          <Anchor
            href={href}
            renderAnchor={({ className, children: anchorChildren }) => (
              <Link className={className} href={href as Route}>
                {anchorChildren}
              </Link>
            )}
          >
            {children}
          </Anchor>
        ) : (
          <Anchor href={href}>{children}</Anchor>
        )
      ) : (
        <p>{children}</p>
      ),
    p: ({ children }) => (
      <p className="sm:text-md vertical:indent-em my-2 text-sm leading-relaxed">
        {children}
      </p>
    ),
    code: ({ children, ...props }) => {
      if (typeof children === 'string') {
        return <Code>{children}</Code>;
      }
      return (
        <code {...props} className="sm:text-md text-sm">
          {children}
        </code>
      );
    },
    pre: (props) => <CodeBlock {...props} />,
    li: ({ children }) => (
      <li className="sm:text-md text-sm leading-relaxed">{children}</li>
    ),
    ul: ({ children }) => (
      <ul className="sm:text-md my-4 flex list-disc flex-col gap-1 ps-5 text-sm">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="sm:text-md my-4 flex list-decimal flex-col gap-1 ps-5 text-sm">
        {children}
      </ol>
    ),
    blockquote: ({ children }) => (
      <figure className="bg-bg-mute my-4 rounded-lg p-2 ps-3">
        <blockquote className="border-border-base text-fg-mute border-s-3 ps-2 text-sm">
          {children}
        </blockquote>
      </figure>
    ),
    ...components,
  };
}
