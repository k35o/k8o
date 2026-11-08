import { afterEach, describe, expect, it } from 'vitest';

import { getFrontmatter, findFrontmatter } from './frontmatter';

describe('getFrontmatter', () => {
  const tempPaths: string[] = [];

  afterEach(async () => {
    const { rm } = await import('node:fs/promises');
    await Promise.all(
      tempPaths.map((path) => rm(path, { recursive: true, force: true })),
    );
    tempPaths.length = 0;
  });

  it('MDXファイルのfrontmatterを取得できる', async () => {
    const { mkdtemp, writeFile } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const path = await import('node:path');

    const dir = await mkdtemp(path.join(tmpdir(), 'frontmatter-'));
    const filePath = path.join(dir, 'article.mdx');
    tempPaths.push(dir);

    await writeFile(
      filePath,
      `---
title: テスト記事
description: 説明文
createdAt: 2026-03-01T00:00:00.000Z
updatedAt: 2026-03-02T00:00:00.000Z
---

本文
`,
    );

    const result = await getFrontmatter(filePath);

    expect(result.title).toBe('テスト記事');
    expect(result.description).toBe('説明文');
    expect(result.createdAt).toBe('2026-03-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2026-03-02T00:00:00.000Z');
  });

  it('frontmatter が無効な場合はエラーを投げる', async () => {
    const { mkdtemp, writeFile } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const path = await import('node:path');

    const dir = await mkdtemp(path.join(tmpdir(), 'frontmatter-'));
    const filePath = path.join(dir, 'article.mdx');
    tempPaths.push(dir);

    await writeFile(filePath, `---\ntitle: タイトルのみ\n---\n本文\n`);

    await expect(getFrontmatter(filePath)).rejects.toThrow(
      'Invalid frontmatter',
    );
  });
});

describe('findFrontmatter', () => {
  const tempPaths: string[] = [];

  afterEach(async () => {
    const { rm } = await import('node:fs/promises');
    await Promise.all(
      tempPaths.map((path) => rm(path, { recursive: true, force: true })),
    );
    tempPaths.length = 0;
  });

  it('MDXファイルが存在する場合はfrontmatterを返す', async () => {
    const { mkdtemp, writeFile } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const path = await import('node:path');

    const dir = await mkdtemp(path.join(tmpdir(), 'frontmatter-'));
    const filePath = path.join(dir, 'article.mdx');
    tempPaths.push(dir);

    await writeFile(
      filePath,
      `---
title: テスト記事
description: 説明文
createdAt: 2026-03-01T00:00:00.000Z
updatedAt: 2026-03-02T00:00:00.000Z
---

本文
`,
    );

    const result = await findFrontmatter(filePath);

    expect(result?.title).toBe('テスト記事');
  });

  it('ファイルが存在しない場合はnullを返す', async () => {
    const { mkdtemp } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const path = await import('node:path');

    const dir = await mkdtemp(path.join(tmpdir(), 'frontmatter-'));
    tempPaths.push(dir);

    const result = await findFrontmatter(path.join(dir, 'missing.mdx'));

    expect(result).toBeNull();
  });

  it('ファイル欠損以外のエラー（frontmatter不正）はそのまま投げる', async () => {
    const { mkdtemp, writeFile } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const path = await import('node:path');

    const dir = await mkdtemp(path.join(tmpdir(), 'frontmatter-'));
    const filePath = path.join(dir, 'article.mdx');
    tempPaths.push(dir);

    await writeFile(filePath, `---\ntitle: タイトルのみ\n---\n本文\n`);

    await expect(findFrontmatter(filePath)).rejects.toThrow(
      'Invalid frontmatter',
    );
  });
});
