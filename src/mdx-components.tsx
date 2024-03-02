import type { MDXComponents } from 'mdx/types';
import { Anchor } from './app/_components/anchor';

export function useMDXComponents(
  components: MDXComponents,
): MDXComponents {
  return {
    h1: ({ children }) => (
      <h2 className="pb-4 pt-6 text-xl font-bold sm:text-2xl">
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h3 className="py-4 text-xl font-bold sm:text-2xl">
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4 className="py-4 text-lg font-bold sm:text-xl">
        {children}
      </h4>
    ),
    h4: ({ children }) => (
      <h5 className="py-4 text-base font-bold sm:text-lg">
        {children}
      </h5>
    ),
    h5: ({ children }) => (
      <h6 className="py-4 text-sm font-bold sm:text-base">
        {children}
      </h6>
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
            className="m-1 rounded-lg bg-bgLight px-1 text-xs sm:text-base"
          />
        );
      }
      return <code {...props} className="p-1 text-xs sm:text-base" />;
    },
    pre: ({ children, ...rest }) => {
      return (
        <pre
          {...rest}
          className="my-4 overflow-x-auto rounded-xl bg-bgDark p-1 sm:p-4"
        >
          {children}
        </pre>
      );
    },
    ...components,
  };
}
