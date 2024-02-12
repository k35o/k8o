import type { MDXComponents } from 'mdx/types';
import { Anchor } from './app/_components/anchor';

export function useMDXComponents(
  components: MDXComponents,
): MDXComponents {
  return {
    h1: ({ children }) => (
      <h2 className="border-gray-600 pb-4 pt-6 text-2xl">
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h3 className="py-4 text-2xl font-bold">{children}</h3>
    ),
    h3: ({ children }) => (
      <h4 className="py-4 text-xl font-bold">{children}</h4>
    ),
    h4: ({ children }) => (
      <h5 className="text-l py-4 font-bold">{children}</h5>
    ),
    h5: ({ children }) => (
      <h6 className="py-4 font-bold">{children}</h6>
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
    p: ({ children }) => <p className="leading-normal my-2 font-sx sm:font-base">{children}</p>,
    code: (props) => {
      if (typeof props.children === 'string') {
        return (
          <code
            {...props}
            className="m-1 rounded-lg bg-slate-200 px-1 font-xs sm:font-base"
          />
        );
      }
      return <code {...props} className="p-1 font-xs sm:font-base" />;
    },
    pre: ({ children, ...rest }) => {
      return (
        <pre
          {...rest}
          className="my-4 overflow-x-auto rounded-xl bg-slate-900 p-1 sm:p-4"
        >
          {children}
        </pre>
      );
    },
    ...components,
  };
}
