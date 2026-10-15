import { Anchor, Code, LinkIcon } from '@k8ordo/ui';
import { cn } from '@repo/helpers/cn';
import { isInternalRoute } from '@repo/helpers/is-internal-route';
import type { MDXComponents } from 'mdx/types';
import type { Route } from 'next';
import Link from 'next/link';
import { isValidElement } from 'react';
import type { FC, PropsWithChildren, ReactNode } from 'react';

import { BrowserSupportStatus } from '@/app/_components/browser-support-status/browser-support-status';
import { CodeBlock, CodeGroup } from '@/app/_components/code-block';

import styles from './mdx-components.module.css';

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

type HeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const headingLevelClass: Record<HeadingLevel, string> = {
  h2: styles.h2,
  h3: styles.h3,
  h4: styles.h4,
  h5: styles.h5,
  h6: styles.h6,
};

const LinkHeading: FC<PropsWithChildren<{ type: HeadingLevel }>> = ({
  type,
  children,
}) => {
  const Comp = type;

  const text = extractText(children);
  const hasText = text !== '';

  return (
    <Comp
      className={cn(styles.heading, headingLevelClass[type])}
      id={hasText ? text : undefined}
    >
      {hasText && (
        <a
          className={styles.anchor}
          href={`#${encodeURIComponent(text)}`}
          tabIndex={-1}
        >
          <span className={styles.anchorIcon}>
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
    p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
    code: ({ children, ...props }) => {
      if (typeof children === 'string') {
        return <Code>{children}</Code>;
      }
      return (
        <code {...props} className={styles.code}>
          {children}
        </code>
      );
    },
    pre: (props) => <CodeBlock {...props} />,
    'code-group': CodeGroup,
    li: ({ children }) => <li className={styles.listItem}>{children}</li>,
    ul: ({ children }) => <ul className={styles.unorderedList}>{children}</ul>,
    ol: ({ children }) => <ol className={styles.orderedList}>{children}</ol>,
    blockquote: ({ children }) => (
      <blockquote className={styles.blockquote}>{children}</blockquote>
    ),
    ...components,
  };
}
