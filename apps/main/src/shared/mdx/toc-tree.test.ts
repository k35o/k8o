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

  it('同じh2配下の複数のh3とh4を正しくぶら下げる', async () => {
    const filePath = await createMdxFile(`## セクション1

### 小見出し1

#### 詳細1

### 小見出し2

#### 詳細2

## セクション2
`);

    await expect(getTocTree(filePath)).resolves.toEqual({
      depth: 0,
      children: [
        {
          depth: 1,
          text: 'セクション1',
          children: [
            {
              depth: 2,
              text: '小見出し1',
              children: [{ depth: 3, text: '詳細1' }],
            },
            {
              depth: 2,
              text: '小見出し2',
              children: [{ depth: 3, text: '詳細2' }],
            },
          ],
        },
        {
          depth: 1,
          text: 'セクション2',
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

  it('h5以深の見出しは目次に含めない', async () => {
    const filePath = await createMdxFile(`## セクション

### 小見出し

#### 詳細

##### 無視される見出し
`);

    await expect(getTocTree(filePath)).resolves.toEqual({
      depth: 0,
      children: [
        {
          depth: 1,
          text: 'セクション',
          children: [
            {
              depth: 2,
              text: '小見出し',
              children: [{ depth: 3, text: '詳細' }],
            },
          ],
        },
      ],
    });
  });
});
