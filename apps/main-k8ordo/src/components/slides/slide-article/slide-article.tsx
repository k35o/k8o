import { notFound } from '@k8ordo/framework';
import type { MDXContent } from 'mdx/types';
import type { FC } from 'react';

import { MdxContent } from '@/components/site/mdx-base/mdx-base';
import { slideMdxComponents } from '@/components/slides/slide-mdx-components/slide-mdx-components';

// plugin-rsc は .tsx などの部品にしか、import した CSS を差し込む包みを付けない。
// query で .mdx の default も包ませ、デッキが import する CSS を載せる
const decks = import.meta.glob<MDXContent>('@content/slides/*/content.mdx', {
  import: 'default',
  query: '?vite-rsc-css-export=default',
});

const DECK_FILE = /\/slides\/([a-z0-9-]+)\/content\.mdx$/u;

const loadDeck = new Map(
  Object.entries(decks).flatMap(([file, load]) => {
    const slug = DECK_FILE.exec(file)?.[1];
    return slug === undefined ? [] : [[slug, load] as const];
  }),
);

export const SlideArticle: FC<{ slug: string }> = async ({ slug }) => {
  const load = loadDeck.get(slug);
  if (load === undefined) {
    notFound();
  }
  const Deck = await load();
  return <MdxContent Content={Deck} components={slideMdxComponents} />;
};
