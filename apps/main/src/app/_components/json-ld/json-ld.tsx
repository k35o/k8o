import type { FC } from 'react';

import { serializeJsonLd } from '@/shared/site/json-ld';
import type { JsonLdObject } from '@/shared/site/json-ld';

export const JsonLd: FC<{ data: JsonLdObject }> = ({ data }) => (
  <script
    dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    type="application/ld+json"
  />
);
