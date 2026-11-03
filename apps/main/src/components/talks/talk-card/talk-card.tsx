import { LocationIcon } from '@k8ordo/ui';
import type { ComponentProps, FC } from 'react';

import { TalkCardView } from './talk-card-view';

// LocationIcon をどのページも読むファイルに載せないよう、サーバーで描いて渡す
export const TalkCard: FC<
  Omit<ComponentProps<typeof TalkCardView>, 'locationIcon'>
> = (props) => (
  <TalkCardView {...props} locationIcon={<LocationIcon size="sm" />} />
);
