const HEX_BASE = 16 as const;

export const uuidV4 = (): string => {
  if (typeof window !== 'undefined' && isSecureContext) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const randHex = Math.floor(Math.random() * HEX_BASE);
    if (c === 'y') {
      return ((randHex & 0x3) | 0x8).toString(HEX_BASE);
    }
    return randHex.toString(HEX_BASE);
  });
};

if (import.meta.vitest) {
  const testRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  it('安全なコンテキストではrandUUIDからuuidv4を返す', () => {
    vi.stubGlobal('isSecureContext', true);
    const result = uuidV4();

    expect(result).toMatch(testRegex);
  });

  it('安全なコンテキスト外では自作のuuidv4を返す', () => {
    vi.stubGlobal('isSecureContext', false);

    const result = uuidV4();

    expect(result).toMatch(testRegex);
  });
}
