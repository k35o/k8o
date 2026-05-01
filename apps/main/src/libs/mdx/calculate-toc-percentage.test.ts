import { calculateTocPercentage } from './calculate-toc-percentage';
import type { HeadingTree } from './types';

describe('calculateTocPercentage', () => {
  describe('activeIdが空文字の場合', () => {
    it('0を返すべき', () => {
      const tree: HeadingTree = {
        depth: 0,
        children: [],
      };
      expect(calculateTocPercentage('', tree)).toBe(0);
    });
  });

  describe('depth1レベルの進捗', () => {
    it('depth1が4つある場合、1つ目は0%（直前まで）', () => {
      const tree: HeadingTree = {
        depth: 0,
        children: [
          { depth: 1, text: '見出し1', children: [] },
          { depth: 1, text: '見出し2', children: [] },
          { depth: 1, text: '見出し3', children: [] },
          { depth: 1, text: '見出し4', children: [] },
        ],
      };
      expect(calculateTocPercentage('見出し1', tree)).toBe(0);
    });

    it('depth1が4つある場合、2つ目は25%（直前まで）', () => {
      const tree: HeadingTree = {
        depth: 0,
        children: [
          { depth: 1, text: '見出し1', children: [] },
          { depth: 1, text: '見出し2', children: [] },
          { depth: 1, text: '見出し3', children: [] },
          { depth: 1, text: '見出し4', children: [] },
        ],
      };
      expect(calculateTocPercentage('見出し2', tree)).toBe(25);
    });

    it('depth1が4つある場合、4つ目は75%（直前まで）', () => {
      const tree: HeadingTree = {
        depth: 0,
        children: [
          { depth: 1, text: '見出し1', children: [] },
          { depth: 1, text: '見出し2', children: [] },
          { depth: 1, text: '見出し3', children: [] },
          { depth: 1, text: '見出し4', children: [] },
        ],
      };
      expect(calculateTocPercentage('見出し4', tree)).toBe(75);
    });
  });

  describe('depth2レベルの進捗', () => {
    it('depth1が4つ、2つ目のdepth1に5つのdepth2がある場合、1つ目のdepth2は25%（直前まで）', () => {
      const tree: HeadingTree = {
        depth: 0,
        children: [
          { depth: 1, text: '見出し1', children: [] },
          {
            depth: 1,
            text: '見出し2',
            children: [
              { depth: 2, text: '見出し2-1', children: [] },
              { depth: 2, text: '見出し2-2', children: [] },
              { depth: 2, text: '見出し2-3', children: [] },
              { depth: 2, text: '見出し2-4', children: [] },
              { depth: 2, text: '見出し2-5', children: [] },
            ],
          },
          { depth: 1, text: '見出し3', children: [] },
          { depth: 1, text: '見出し4', children: [] },
        ],
      };
      expect(calculateTocPercentage('見出し2-1', tree)).toBe(25);
    });

    it('depth1が4つ、2つ目のdepth1に5つのdepth2がある場合、3つ目のdepth2は35%（直前まで）', () => {
      const tree: HeadingTree = {
        depth: 0,
        children: [
          { depth: 1, text: '見出し1', children: [] },
          {
            depth: 1,
            text: '見出し2',
            children: [
              { depth: 2, text: '見出し2-1', children: [] },
              { depth: 2, text: '見出し2-2', children: [] },
              { depth: 2, text: '見出し2-3', children: [] },
              { depth: 2, text: '見出し2-4', children: [] },
              { depth: 2, text: '見出し2-5', children: [] },
            ],
          },
          { depth: 1, text: '見出し3', children: [] },
          { depth: 1, text: '見出し4', children: [] },
        ],
      };
      expect(calculateTocPercentage('見出し2-3', tree)).toBe(35);
    });
  });

  describe('depth3レベルの進捗', () => {
    it('正しく計算されるべき（直前まで）', () => {
      const tree: HeadingTree = {
        depth: 0,
        children: [
          { depth: 1, text: '見出し1', children: [] },
          {
            depth: 1,
            text: '見出し2',
            children: [
              { depth: 2, text: '見出し2-1', children: [] },
              {
                depth: 2,
                text: '見出し2-2',
                children: [
                  { depth: 3, text: '見出し2-2-1' },
                  { depth: 3, text: '見出し2-2-2' },
                ],
              },
              { depth: 2, text: '見出し2-3', children: [] },
              { depth: 2, text: '見出し2-4', children: [] },
              { depth: 2, text: '見出し2-5', children: [] },
            ],
          },
          { depth: 1, text: '見出し3', children: [] },
          { depth: 1, text: '見出し4', children: [] },
        ],
      };
      expect(calculateTocPercentage('見出し2-2-1', tree)).toBe(30);
    });

    it('depth3の進捗が小数になる場合は四捨五入される', () => {
      const tree: HeadingTree = {
        depth: 0,
        children: [
          {
            depth: 1,
            text: '見出し1',
            children: [
              {
                depth: 2,
                text: '見出し1-1',
                children: [
                  { depth: 3, text: '見出し1-1-1' },
                  { depth: 3, text: '見出し1-1-2' },
                  { depth: 3, text: '見出し1-1-3' },
                ],
              },
            ],
          },
          {
            depth: 1,
            text: '見出し2',
            children: [],
          },
          {
            depth: 1,
            text: '見出し3',
            children: [],
          },
        ],
      };

      expect(calculateTocPercentage('見出し1-1-2', tree)).toBe(11);
    });
  });

  describe('エッジケース', () => {
    it('見出しが見つからない場合は0を返すべき', () => {
      const tree: HeadingTree = {
        depth: 0,
        children: [{ depth: 1, text: '見出し1', children: [] }],
      };
      expect(calculateTocPercentage('存在しない見出し', tree)).toBe(0);
    });

    it('見出しが1つだけの場合は0%を返すべき（直前まで）', () => {
      const tree: HeadingTree = {
        depth: 0,
        children: [{ depth: 1, text: '見出し1', children: [] }],
      };
      expect(calculateTocPercentage('見出し1', tree)).toBe(0);
    });

    it('depth2配下が空の見出しはdepth1として扱う', () => {
      const tree: HeadingTree = {
        depth: 0,
        children: [
          {
            depth: 1,
            text: '見出し1',
            children: [],
          },
          {
            depth: 1,
            text: '見出し2',
            children: [],
          },
        ],
      };

      expect(calculateTocPercentage('見出し2', tree)).toBe(50);
    });
  });
});
