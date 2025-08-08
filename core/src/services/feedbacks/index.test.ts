import { FEEDBACK_OPTIONS } from './constants';
import type { FeedbackType } from './types';

describe('feedbacks service', () => {
  describe('FEEDBACK_OPTIONS', () => {
    it('8つのフィードバックオプションが定義されている', () => {
      expect(FEEDBACK_OPTIONS).toHaveLength(8);
    });

    it('各オプションが必要なプロパティを持っている', () => {
      FEEDBACK_OPTIONS.forEach((option) => {
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('icon');

        expect(typeof option.id).toBe('number');
        expect(typeof option.value).toBe('string');
        expect(typeof option.label).toBe('string');
        expect(typeof option.icon).toBe('function');
      });
    });

    it('IDが一意である', () => {
      const ids = FEEDBACK_OPTIONS.map((option) => option.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toHaveLength(uniqueIds.length);
    });

    it('valueが一意である', () => {
      const values = FEEDBACK_OPTIONS.map((option) => option.value);
      const uniqueValues = [...new Set(values)];
      expect(values).toHaveLength(uniqueValues.length);
    });

    it('FeedbackTypeの全ての値をカバーしている', () => {
      const expectedValues: FeedbackType[] = [
        'good',
        'bad',
        'interesting',
        'boring',
        'informative',
        'shallow',
        'easy',
        'difficult',
      ];

      const actualValues = FEEDBACK_OPTIONS.map((option) => option.value);
      expectedValues.forEach((value) => {
        expect(actualValues).toContain(value);
      });
    });

    it('特定のフィードバックオプションが正しく定義されている', () => {
      const goodOption = FEEDBACK_OPTIONS.find(
        (option) => option.value === 'good',
      );
      expect(goodOption).toBeDefined();
      expect(goodOption?.id).toBe(1);
      expect(goodOption?.value).toBe('good');
      expect(goodOption?.label).toBe('良い');
      expect(typeof goodOption?.icon).toBe('function');

      const badOption = FEEDBACK_OPTIONS.find(
        (option) => option.value === 'bad',
      );
      expect(badOption).toBeDefined();
      expect(badOption?.id).toBe(2);
      expect(badOption?.value).toBe('bad');
      expect(badOption?.label).toBe('悪い');
      expect(typeof badOption?.icon).toBe('function');
    });
  });
});
