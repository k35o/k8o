// vite.config.ts の blogDemoScripts（src/site/blog-demo-scripts.ts）が作る
declare module 'virtual:blog-demo-scripts' {
  export const findDemoScript: (
    slug: string,
    name: string,
  ) => string | undefined;
}
