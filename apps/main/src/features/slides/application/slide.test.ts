import { findFrontmatter } from '@repo/helpers/mdx/frontmatter';
import { describe, expect, it, vi } from 'vitest';

import { slidePath } from './path';
import { findSlideMetadata } from './slide';

vi.mock('@repo/helpers/mdx/frontmatter');
vi.mock('./path');

describe('slide service', () => {
  describe('findSlideMetadata', () => {
    describe('正常系', () => {
      it('MDXファイルが存在する場合はメタデータを返す', async () => {
        const mockMetadata = {
          title: 'Test Slide',
          description: 'desc',
          createdAt: '2026-05-15T00:00:00.000Z',
          updatedAt: '2026-05-15T00:00:00.000Z',
        };

        vi.mocked(slidePath).mockReturnValue('/path/to/slide');
        vi.mocked(findFrontmatter).mockResolvedValue(mockMetadata);

        const result = await findSlideMetadata('test-slug');

        expect(result).toBe(mockMetadata);
      });
    });

    describe('異常系', () => {
      it('MDXファイルが存在しない場合はnullを返し警告を出す', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.mocked(slidePath).mockReturnValue('/path/to/slide');
        vi.mocked(findFrontmatter).mockResolvedValue(null);

        const result = await findSlideMetadata('missing-slug');

        expect(result).toBeNull();
        expect(warn).toHaveBeenCalledWith(
          'スライド "missing-slug" のMDXファイルが存在しないため一覧から除外します',
        );
        warn.mockRestore();
      });

      it('ファイル欠損以外のエラーはそのまま投げる', async () => {
        vi.mocked(slidePath).mockReturnValue('/path/to/slide');
        vi.mocked(findFrontmatter).mockRejectedValue(
          new Error('Invalid frontmatter in /path/to/slide'),
        );

        await expect(findSlideMetadata('broken-slug')).rejects.toThrow(
          'Invalid frontmatter',
        );
      });
    });
  });
});
