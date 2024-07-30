import { Route } from 'next';

// NOTE:型推論は厳密ではないので注意が必要
export const isInternalRoute = (href: string): href is Route =>
  !href.startsWith('http');
