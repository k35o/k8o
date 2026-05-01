export type HeadingTree = {
  depth: 0;
  children: Array<{
    depth: 1;
    text: string;
    children: Array<{
      depth: 2;
      text: string;
      children: Array<{
        depth: 3;
        text: string;
      }>;
    }>;
  }>;
};
