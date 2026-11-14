import { MapPinIcon } from '@k8ordo/ui/icons';
import type { ComponentProps, FC } from 'react';

import { TalkCardView } from './talk-card-view';

// MapPinIcon をどのページも読むファイルに載せないよう、サーバーで描いて渡す
export const TalkCard: FC<
  Omit<ComponentProps<typeof TalkCardView>, 'locationIcon'>
> = (props) => (
  <TalkCardView {...props} locationIcon={<MapPinIcon size="sm" />} />
);
