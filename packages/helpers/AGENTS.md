# @repo/helpers AGENTS.md

アプリ非依存の純粋ヘルパーを置く。

## 置くもの / 置かないもの

- 置く: Next.js / React / DB / 認証などに依存しない汎用ロジック。`cn`（className文字列の合成）もここ
- 置かない: app固有のロジック、UIコンポーネント、外部サービス接続

## テスト方針: in-source testing

`if (import.meta.vitest)` ブロックで同ファイル内にテストを書く。

```ts
export const add = (a: number, b: number) => a + b;

if (import.meta.vitest) {
  const { describe, expect, test } = import.meta.vitest;
  describe('add', () => {
    test('正常系', () => expect(add(1, 2)).toBe(3));
  });
}
```
