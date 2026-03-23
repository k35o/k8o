'use client';

import { unstable_catchError } from 'next/error';
import type { ReactNode } from 'react';

function Fallback({ fallback }: { fallback: ReactNode }) {
  return fallback;
}

export const ActivityErrorBoundary = unstable_catchError(Fallback);
