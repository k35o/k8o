# @repo/talk-deck CLAUDE.md

PDF から作るトークのデッキの形を置く。デッキを作る `tools/media` の `upload:talk-deck` と、デッキを取り込んで描く `apps/main` が、ここを通して同じ形を読む。

- `@repo/talk-deck/deck` … `deck.json` の型と検証（`parsePdfDeck`）
- `@repo/talk-deck/files` … ファイルの名前と画像の幅、ストアのパス（`talks/<slug>/`）、slug の形

## 置くもの / 置かないもの

- 置く: 作る側と読む側が同じでなければならない約束（形・名前・パス）
- 置かない: PDF を読む処理と、ストアの読み書き。PDF を読むのは `tools/media` だけで、ストアは作る側（上げる・消す）と読む側（ビルドでの取り込み）がそれぞれ `@vercel/blob` を呼ぶ

`tools/media` の script が素の Node でこのパッケージを読むので、相対 import に拡張子を書く。
