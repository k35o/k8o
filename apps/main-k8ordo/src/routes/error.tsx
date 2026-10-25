'use client';

import type { ErrorProps } from '@k8ordo/framework';

import { ErrorFallback } from '@/components/site/error-fallback/error-fallback';

export default function RootError({ error, reset }: ErrorProps) {
  return <ErrorFallback error={error} reset={reset} />;
}
