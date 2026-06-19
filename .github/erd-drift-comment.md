<!-- erd-drift -->
## 🗂️ ER 図が古くなっています

`packages/database/src/schema` の変更に対して、README の ER 図が再生成されていません。

次を実行して `packages/database/README.md` を commit してください。

```bash
pnpm -F database run build:erd
```
