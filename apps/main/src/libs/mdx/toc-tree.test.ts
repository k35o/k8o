import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getTocTree } from './toc-tree';

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.map((dir) => rm(dir, { recursive: true, force: true })),
  );
  tempDirs.length = 0;
});

const createMdxFile = async (content: string): Promise<string> => {
  const dir = await mkdtemp(join(tmpdir(), 'toc-tree-'));
  tempDirs.push(dir);
  const filePath = join(dir, 'article.mdx');
  await writeFile(filePath, content);
  return filePath;
};

describe('getTocTree', () => {
  it('h2からh4までの見出しを階層構造で返す', async () => {
    const filePath = await createMdxFile(`---
title: test
---

# h1

## はじめに

### 背景

#### 詳細

## まとめ
`);

    await expect(getTocTree(filePath)).resolves.toEqual({
      depth: 0,
      children: [
        {
          depth: 1,
          text: 'はじめに',
          children: [
            {
              depth: 2,
              text: '背景',
              children: [{ depth: 3, text: '詳細' }],
            },
          ],
        },
        {
          depth: 1,
          text: 'まとめ',
          children: [],
        },
      ],
    });
  });

  it('h2より浅い見出しやテキスト以外の見出しは無視する', async () => {
    const filePath = await createMdxFile(`# h1

### 孤立したh3

## 見出し

### **strong**

#### 孤立したh4
`);

    await expect(getTocTree(filePath)).resolves.toEqual({
      depth: 0,
      children: [
        {
          depth: 1,
          text: '見出し',
          children: [],
        },
      ],
    });
  });
});
