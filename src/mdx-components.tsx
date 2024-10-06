import type { MDXComponents } from 'mdx/types';
import { Link } from 'lucide-react';
import { Anchor } from './components/anchor';
import { FC, PropsWithChildren } from 'react';
import clsx from 'clsx';

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
      className={clsx(
        'group my-4 font-bold',
        type === 'h2' && 'mb-4 text-xl sm:text-2xl',
        type === 'h3' && 'text-xl sm:text-2xl',
        type === 'h4' && 'text-lg sm:text-xl',
        type === 'h5' && 'text-base sm:text-lg',
        type === 'h6' && 'text-sm sm:text-base',
      )}
    >
      {isStringChildren && (
        <a
          className="relative"
          aria-hidden="true"
          tabIndex={-1}
          href={`#${encodeURIComponent(children)}`}
        >
          <Link
            className={clsx(
              'absolute top-1 box-content text-textDescription opacity-0 sm:group-hover:opacity-100',
              type === 'h2' && '-left-7 size-6 pr-2',
              type === 'h3' && '-left-7 size-6 pr-2',
              type === 'h4' && '-left-6 size-5 pr-2',
              type === 'h5' && '-left-6 size-5 pr-2',
              type === 'h6' && '-left-6 size-5 pr-2',
            )}
          />
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
    a: ({ href, children }) => (
      <>
        {href ? (
          <Anchor href={href}>{children}</Anchor>
        ) : (
          <p>{children}</p>
        )}
      </>
    ),
    p: ({ children }) => (
      <p className="my-2 text-xs leading-normal sm:text-base">
        {children}
      </p>
    ),
    code: (props) => {
      if (typeof props.children === 'string') {
        return (
          <code
            {...props}
            className="m-1 rounded-lg bg-bgPrimary px-1 text-xs sm:text-base"
          />
        );
      }
      return <code {...props} className="p-1 text-xs sm:text-base" />;
    },
    pre: ({ children, ...rest }) => {
      return (
        <pre
          {...rest}
          className="my-4 overflow-x-auto rounded-xl bg-bgCodeBlock p-1 sm:p-4"
        >
          {children}
        </pre>
      );
    },
    ...components,
  };
}
