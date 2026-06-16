// FormData から文字列フィールドを取り出す。File や未設定(null)のときは空文字を返す。
export const getStringField = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('getStringField', () => {
    it('文字列フィールドをそのまま返す', () => {
      const formData = new FormData();
      formData.set('name', 'k8o');
      expect(getStringField(formData, 'name')).toBe('k8o');
    });

    it('未設定のキーは空文字を返す', () => {
      expect(getStringField(new FormData(), 'missing')).toBe('');
    });
  });
}
