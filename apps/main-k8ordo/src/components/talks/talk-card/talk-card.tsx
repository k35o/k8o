import { LocationIcon } from '@k8ordo/ui';
import type { ComponentProps, FC } from 'react';

import { TalkCardView } from './talk-card-view';

// @k8ordo/ui のアイコンは 1 つのモジュールにまとまっていて、クライアントの部品が
// 描くとどのページも読む共有のチャンクに載る。/talks だけが使う LocationIcon は
// サーバーで描いて渡す
export const TalkCard: FC<
  Omit<ComponentProps<typeof TalkCardView>, 'locationIcon'>
> = (props) => (
  <TalkCardView {...props} locationIcon={<LocationIcon size="sm" />} />
);
