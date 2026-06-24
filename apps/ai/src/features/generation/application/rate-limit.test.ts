import { generationLimit, isOverLimit, windowStartIso } from './rate-limit';

describe('rate-limit', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('正常系', () => {
    it('上限未満は false、上限到達以上で true', () => {
      expect(isOverLimit(59, 60)).toBe(false);
      expect(isOverLimit(60, 60)).toBe(true);
      expect(isOverLimit(61, 60)).toBe(true);
    });

    it('windowStartIso は now から1時間前の ISO を返す', () => {
      const now = Date.parse('2026-06-23T12:00:00.000Z');
      expect(windowStartIso(now)).toBe('2026-06-23T11:00:00.000Z');
    });

    it('generationLimit は正の整数 env を採用する', () => {
      vi.stubEnv('AI_GENERATE_LIMIT_PER_HOUR', '120');
      expect(generationLimit()).toBe(120);
    });
  });

  describe('エッジケース', () => {
    it('不正な env は既定値 60 にフォールバックする', () => {
      vi.stubEnv('AI_GENERATE_LIMIT_PER_HOUR', 'abc');
      expect(generationLimit()).toBe(60);
    });

    it('0 以下の env は既定値 60 にフォールバックする', () => {
      vi.stubEnv('AI_GENERATE_LIMIT_PER_HOUR', '0');
      expect(generationLimit()).toBe(60);
    });
  });
});
