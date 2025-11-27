'use client';

import { formatDate } from '@repo/helpers/date/format';

export function Footer() {
  return (
    <footer className="flex items-center justify-center p-4">
      <div className="max-w-5xl">
        <p className="text-fg-mute md:text-lg">
          ©︎ 2024〜{formatDate(new Date(), 'yyyy')} k8o. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
