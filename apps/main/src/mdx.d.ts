declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types';
  import type { ComponentType } from 'react';

  const Content: ComponentType<MDXProps>;
  export default Content;
}
