import { join } from 'node:path';
import { cwd } from 'node:process';
import { blogPath } from './path';

vi.mock('path');
vi.mock('process');

describe('blogPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正しいブログファイルのパスを生成する', () => {
    const mockCwd = '/Users/test/project';
    const mockJoin = vi
      .fn()
      .mockReturnValue(
        '/Users/test/project/src/app/blog/(articles)/test-slug/page.mdx',
      );

    vi.mocked(cwd).mockReturnValue(mockCwd);
    vi.mocked(join).mockImplementation(mockJoin);

    const result = blogPath('test-slug');

    expect(cwd).toHaveBeenCalled();
    expect(join).toHaveBeenCalledWith(
      mockCwd,
      'src/app/blog/(articles)/test-slug/page.mdx',
    );
    expect(result).toBe(
      '/Users/test/project/src/app/blog/(articles)/test-slug/page.mdx',
    );
  });

  it('異なるスラッグでも正しいパスを生成する', () => {
    const mockCwd = '/root/app';
    const mockJoin = vi
      .fn()
      .mockReturnValue(
        '/root/app/src/app/blog/(articles)/another-blog/page.mdx',
      );

    vi.mocked(cwd).mockReturnValue(mockCwd);
    vi.mocked(join).mockImplementation(mockJoin);

    const result = blogPath('another-blog');

    expect(join).toHaveBeenCalledWith(
      mockCwd,
      'src/app/blog/(articles)/another-blog/page.mdx',
    );
    expect(result).toBe(
      '/root/app/src/app/blog/(articles)/another-blog/page.mdx',
    );
  });

  it('特殊文字を含むスラッグでも動作する', () => {
    const mockCwd = '/project';
    const mockJoin = vi
      .fn()
      .mockReturnValue(
        '/project/src/app/blog/(articles)/special-chars-123/page.mdx',
      );

    vi.mocked(cwd).mockReturnValue(mockCwd);
    vi.mocked(join).mockImplementation(mockJoin);

    const result = blogPath('special-chars-123');

    expect(join).toHaveBeenCalledWith(
      mockCwd,
      'src/app/blog/(articles)/special-chars-123/page.mdx',
    );
    expect(result).toBe(
      '/project/src/app/blog/(articles)/special-chars-123/page.mdx',
    );
  });
});
