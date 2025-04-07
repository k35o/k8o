import { Anchor } from './components/anchor';
import { LinkIcon } from './components/icons';
import { cn } from '@/utils/cn';
import type { MDXComponents } from 'mdx/types';
import { FC, PropsWithChildren } from 'react';

const LinkHeading: FC<
  PropsWithChildren<{
    type: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  }>
> = ({ type, children }) => {
  const Comp = type;

  const isStringChildren = typeof children === 'string';

  return (
    <Comp
      id={isStringChildren ? children : undefined}
      className={cn(
        'group my-4 font-bold',
        type === 'h2' && 'mb-4 text-xl sm:text-2xl',
        type === 'h3' && 'text-xl sm:text-2xl',
        type === 'h4' && 'text-lg sm:text-xl',
        type === 'h5' && 'text-md sm:text-lg',
        type === 'h6' && 'sm:text-md text-sm',
      )}
    >
      {isStringChildren && (
        <a
          className="relative"
          aria-hidden="true"
          tabIndex={-1}
          href={`#${encodeURIComponent(children)}`}
        >
          <span
            className={cn(
              'text-fg-mute absolute top-1 box-content opacity-0 transition-opacity duration-500 sm:group-hover:opacity-100',
              type === 'h2' && 'top-1.5 -left-7 pr-2',
              type === 'h3' && '-left-7 pr-2',
              type === 'h4' && 'top-2 -left-5 pr-2',
              type === 'h5' && 'top-1.5 -left-5 pr-2',
              type === 'h6' && '-left-5 pr-2',
            )}
          >
            <LinkIcon
              size={['h2', 'h3'].includes(type) ? 'md' : 'sm'}
            />
          </span>
        </a>
      )}
      {children}
    </Comp>
  );
};

export function useMDXComponents(
  components: MDXComponents,
): MDXComponents {
  return {
    h1: () => null,
    h2: ({ children }) => (
      <LinkHeading type="h3">{children}</LinkHeading>
    ),
    h3: ({ children }) => (
      <LinkHeading type="h4">{children}</LinkHeading>
    ),
    h4: ({ children }) => (
      <LinkHeading type="h5">{children}</LinkHeading>
    ),
    h5: ({ children }) => (
      <LinkHeading type="h6">{children}</LinkHeading>
    ),
    a: ({ href, children }: PropsWithChildren<{ href: string }>) => (
      <>
        {href ? (
          <Anchor href={href}>{children}</Anchor>
        ) : (
          <p>{children}</p>
        )}
      </>
    ),
    p: ({ children }) => (
      <p className="sm:text-md my-2 text-xs leading-normal">
        {children}
      </p>
    ),
    code: ({ children, ...props }) => {
      if (typeof children === 'string') {
        return (
          <code
            {...props}
            className="bg-bg-mute sm:text-md m-1 rounded-md px-1.5 text-xs sm:py-0.5"
          >
            {children}
          </code>
        );
      }
      return (
        <code {...props} className="sm:text-md p-1 text-xs">
          {children}
        </code>
      );
    },
    pre: ({ children, ...rest }) => {
      return (
        <pre
          {...rest}
          className="my-4 overflow-x-auto rounded-lg p-1 sm:p-4"
        >
          {children}
        </pre>
      );
    },
    li: ({ children }) => (
      <li className="sm:text-md list-inside list-disc text-xs">
        {children}
      </li>
    ),
    ul: ({ children }) => (
      <ul className="sm:text-md text-xs">{children}</ul>
    ),
    ...components,
  };
}
