'use client';

import dynamic from 'next/dynamic';

export const BaselineStatus = dynamic(
  () =>
    import('@k8o/arte-odyssey').then((mod) => ({
      default: mod.BaselineStatus,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="border-border-base bg-bg-base h-58 max-w-full animate-pulse rounded-lg border p-4 sm:h-40 md:h-30" />
    ),
  },
);
