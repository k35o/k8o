# @repo/media CLAUDE.md

リポジトリの外にある素材（画像・PDF）を、サイトで配る形にする道具。手で流し、ビルドや CI からは呼ばない。重い依存（sharp・pdfjs-dist・@napi-rs/canvas）は、サイトのコードから読めないようにここにだけ置く。

| script | すること | 使い方 |
|---|---|---|
| `optimize:image` | 画像を AVIF と srcset の版にして書く。記事とトークの画像は、これで変換した AVIF をコミットする | `src/optimize-image.ts` の頭 |
| `upload:talk-deck` | トークの PDF をデッキ（ページの AVIF と `deck.json`）にして、Vercel Blob の非公開ストアへ上げる | `src/upload-talk-deck.ts` の頭と `apps/main/src/components/talks/README.md` |

```bash
pnpm run -F @repo/media optimize:image <入力> <出力.avif> [--max-width <px>]
fnox exec -P vercel -- pnpm run -F @repo/media upload:talk-deck <PDF> --slug <slug> [--notes <ファイル>] [--local]
```

- 引数のパスは、コマンドを流した場所から解く（`src/invocation-dir.ts`）
- `upload:talk-deck` の `--local` はストアに触れず、`apps/main/public/talks/<slug>/` に書くだけで、main の dev でそのまま見られる
- デッキの形（`deck.json`・ファイルの名前・ストアのパス）は `@repo/talk-deck` から読み、main と同じものを使う。PDF を読む処理（ページの文字の抽出・ノートの分割）は、ここにだけ置く
- script は素の Node が TS のまま読むので、相対 import に拡張子を書く。モジュールの読み込みが Node で通ることは `src/upload-talk-deck.test.ts` が確かめる
