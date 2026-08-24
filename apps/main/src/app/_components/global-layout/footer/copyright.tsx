'use client';

import { formatDate } from '@repo/helpers/date/format';

export function Copyright() {
  return (
    <p className="text-fg-mute md:text-lg">
      ©︎ 2024〜{formatDate(new Date(), 'yyyy')} k8o. All Rights Reserved.
    </p>
  );
}
