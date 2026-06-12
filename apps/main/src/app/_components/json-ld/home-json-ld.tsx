import type { FC } from 'react';

import { personJsonLd, websiteJsonLd } from '@/shared/site/json-ld';

import { JsonLd } from './json-ld';

export const HomeJsonLd: FC = () => (
  <>
    <JsonLd data={websiteJsonLd()} />
    <JsonLd data={personJsonLd()} />
  </>
);
