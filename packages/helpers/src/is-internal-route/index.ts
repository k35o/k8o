import { Route } from 'next';

// NOTE:型推論は厳密ではないので注意が必要
export const isInternalRoute = (href: string): href is Route =>
  !href.startsWith('http');

if (import.meta.vitest) {
  it('httpから始まるhrefはexternalなものとして判定する', () => {
    expect(isInternalRoute('https://k8o.me/dummy')).toBe(false);
  });

  it('httpから始まらないhrefはexternalなものとして判定する', () => {
    expect(isInternalRoute('/dummy')).toBe(true);
  });
}
