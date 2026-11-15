import { findDemoScript } from 'virtual:blog-demo-scripts';

export const getBundledDemoScript = (slug: string, name: string): string => {
  const script = findDemoScript(slug, name);
  if (script === undefined) {
    throw new Error(
      `/blog/${slug} の demo="${name}" の tsx を束ねた JS が無い（vite.config の blogDemoScripts が束ねる）`,
    );
  }
  return script;
};
