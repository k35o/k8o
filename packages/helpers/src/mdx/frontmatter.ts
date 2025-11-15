import { read } from 'to-vfile';
import { matter } from 'vfile-matter';

type Frontmatter = {
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const getFrontmatter = async (path: string): Promise<Frontmatter> => {
  const file = await read(path);
  matter(file);
  return file.data.matter as Frontmatter;
};

if (import.meta.vitest) {
  const { describe, expect, it, vi } = import.meta.vitest;

  // to-vfileとvfile-matterのモック
  vi.mock('to-vfile', () => ({
    read: vi.fn(),
  }));

  vi.mock('vfile-matter', () => ({
    matter: vi.fn(),
  }));

  describe('getFrontmatter', () => {
    describe('正常な入力の場合', () => {
      it('frontmatterを正しく抽出できるべき', async () => {
        const { read: mockRead } = await import('to-vfile');
        const { matter: mockMatter } = await import('vfile-matter');

        const mockFile = {
          data: {
            matter: {
              title: 'Test Title',
              description: 'Test Description',
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-02'),
            },
          },
        };

        vi.mocked(mockRead).mockResolvedValue(mockFile as never);
        vi.mocked(mockMatter).mockImplementation(() => {
          // matterはfileオブジェクトを変更するだけなので何もしない
        });

        const result = await getFrontmatter('test.mdx');

        expect(result).toEqual({
          title: 'Test Title',
          description: 'Test Description',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
        });
        expect(mockRead).toHaveBeenCalledWith('test.mdx');
        expect(mockMatter).toHaveBeenCalledWith(mockFile);
      });

      it('descriptionがnullの場合も処理できるべき', async () => {
        const { read: mockRead } = await import('to-vfile');
        const { matter: mockMatter } = await import('vfile-matter');

        const mockFile = {
          data: {
            matter: {
              title: 'Test Title',
              description: null,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-02'),
            },
          },
        };

        vi.mocked(mockRead).mockResolvedValue(mockFile as never);
        vi.mocked(mockMatter).mockImplementation(() => {
          // matterはfileオブジェクトを変更するだけなので何もしない
        });

        const result = await getFrontmatter('test.mdx');

        expect(result.description).toBeNull();
      });
    });

    describe('ファイルパスの処理', () => {
      it('異なるパスでreadを呼び出すべき', async () => {
        const { read: mockRead } = await import('to-vfile');
        const { matter: mockMatter } = await import('vfile-matter');

        const mockFile = {
          data: {
            matter: {
              title: 'Title',
              description: null,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
            },
          },
        };

        vi.mocked(mockRead).mockResolvedValue(mockFile as never);
        vi.mocked(mockMatter).mockImplementation(() => {
          // matterはfileオブジェクトを変更するだけなので何もしない
        });

        await getFrontmatter('path/to/file.mdx');
        expect(mockRead).toHaveBeenCalledWith('path/to/file.mdx');
      });
    });
  });
}
