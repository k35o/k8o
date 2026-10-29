'use client';

import { useAppState } from '@k8ordo/state';
import type { FC } from 'react';

import type { Slide } from '@/components/slides/split-slides/split-slides';

import { BrowserOnly } from '../browser-only/browser-only';
import { DeckPresenter } from '../deck-presenter/deck-presenter';
import { DeckPrint } from '../deck-print/deck-print';
import { DeckViewer } from '../deck-viewer/deck-viewer';
import { slideDeckState } from './deck-state';

type Props = {
  slug: string;
  title: string;
  slides: Slide[];
  qrUrl: string;
};

const Deck: FC<Props> = ({ slug, title, slides, qrUrl }) => {
  const [{ mode }] = useAppState(slideDeckState, ['mode']);

  const deck =
    mode === 'presenter' ? (
      <DeckPresenter qrUrl={qrUrl} slides={slides} slug={slug} title={title} />
    ) : (
      <DeckViewer qrUrl={qrUrl} slides={slides} slug={slug} title={title} />
    );

  return (
    <>
      {deck}
      {/* 印刷/PDF用の全スライド描画（画面では非表示） */}
      <DeckPrint slides={slides} />
    </>
  );
};

// static mode の HTML は URL の state を既定値で描くので、HTML に描くと発表者のタブで観覧の画面が
// 一度出る。表示する枚も URL の hash で決まりブラウザでしか分からないので、デッキはブラウザでだけ描く
export const SlideDeck: FC<Props> = (props) => (
  <BrowserOnly>
    <Deck {...props} />
  </BrowserOnly>
);
