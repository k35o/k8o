// NOTE:型推論は厳密ではないので注意が必要
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const isInternalRoute = <Route extends string>(
  href: string,
): href is Route => !href.startsWith('http');

if (import.meta.vitest) {
  it('httpから始まるhrefはexternalなものとして判定する', () => {
    expect(isInternalRoute('https://k8o.me/dummy')).toBe(false);
  });

  it('httpから始まらないhrefはexternalなものとして判定する', () => {
    expect(isInternalRoute('/dummy')).toBe(true);
  });
}
