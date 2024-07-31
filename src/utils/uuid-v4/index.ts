export const uuidV4 = (): string => {
  if (isSecureContext) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
      const randHex = Math.floor(Math.random() * 16);
      if (c === 'y') {
        return ((randHex & 0x3) | 0x8).toString(16);
      }
      return randHex.toString(16);
    },
  );
};

if (import.meta.vitest) {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });
  it('安全なコンテキストではrandUUIDからuuidv4を返す', () => {
    vi.stubGlobal('isSecureContext', true);
    const excepted =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const result = uuidV4();

    expect(result).toMatch(excepted);
  });

  it('安全なコンテキスト外では自作のuuidv4を返す', () => {
    vi.stubGlobal('isSecureContext', false);
    const excepted =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const result = uuidV4();

    expect(result).toMatch(excepted);
  });
}
