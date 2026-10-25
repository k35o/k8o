import { join } from 'node:path';
import { cwd } from 'node:process';

import { describe, expect, it, vi } from 'vitest';

import { slidePath } from './path';

vi.mock('path');
vi.mock('process');

describe('slidePath', () => {
  it('スライドファイルのパスを生成する', () => {
    const mockCwd = '/Users/test/project';
    const mockJoin = vi
      .fn()
      .mockReturnValue(
        '/Users/test/project/src/content/slides/test-slug/content.mdx',
      );

    vi.mocked(cwd).mockReturnValue(mockCwd);
    vi.mocked(join).mockImplementation(mockJoin);

    const result = slidePath('test-slug');

    expect(join).toHaveBeenCalledWith(
      mockCwd,
      'src/content/slides/test-slug/content.mdx',
    );
    expect(result).toBe(
      '/Users/test/project/src/content/slides/test-slug/content.mdx',
    );
  });
});
