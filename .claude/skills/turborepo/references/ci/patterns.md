# CI最適化パターン

Turborepoを使った効率的なCI/CDの戦略。

## PRビルドとmainブランチビルドの使い分け

### PRビルド: 影響範囲のみ

PRで変更された部分のみをテスト:

```yaml
- name: テスト (PR)
  if: github.event_name == 'pull_request'
  run: turbo run build test --affected
```

### mainブランチ: フルビルド

マージ時に完全な検証を実施:

```yaml
- name: テスト (Main)
  if: github.ref == 'refs/heads/main'
  run: turbo run build test
```

## --filter によるカスタムGit範囲指定

高度なシナリオでは、`--filter` をgit参照と組み合わせて使用:

```bash
# 特定のコミット以降の変更
turbo run test --filter="...[abc123]"

# 参照間の変更
turbo run test --filter="...[main...HEAD]"

# 直近3コミットの変更
turbo run test --filter="...[HEAD~3]"
```

## キャッシュ戦略

### リモートキャッシュ（推奨）

最高のパフォーマンス - すべてのCI実行と開発者間で共有:

```yaml
env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}
```

### actions/cache によるフォールバック

リモートキャッシュが利用できない場合:

```yaml
- uses: actions/cache@v4
  with:
    path: .turbo
    key: turbo-${{ runner.os }}-${{ github.sha }}
    restore-keys: |
      turbo-${{ runner.os }}-${{ github.ref }}-
      turbo-${{ runner.os }}-
```

制限事項:

- キャッシュはブランチスコープ
- PRはベースブランチのキャッシュからリストア
- リモートキャッシュより効率が低い

## マトリックスビルド

複数のNodeバージョンでテスト:

```yaml
strategy:
  matrix:
    node: [18, 20, 22]

steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node }}

  - run: turbo run test
```

## ジョブ間の並列化

タスクを別々のジョブに分割:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: turbo run lint --affected

  test:
    runs-on: ubuntu-latest
    steps:
      - run: turbo run test --affected

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - run: turbo run build
```

### キャッシュに関する考慮事項

並列化する場合:

- 各ジョブは個別にキャッシュを書き込む
- リモートキャッシュはこれを自動的に処理する
- actions/cacheの場合、競合を避けるためにジョブごとに一意のキーを使用する

```yaml
- uses: actions/cache@v4
  with:
    path: .turbo
    key: turbo-${{ runner.os }}-${{ github.job }}-${{ github.sha }}
```

## 条件付きタスク

ドラフトPRでは高負荷なタスクをスキップ:

```yaml
- name: E2Eテスト
  if: github.event.pull_request.draft == false
  run: turbo run test:e2e --affected
```

または、フルテストの実行にラベルを要求:

```yaml
- name: フルテストスイート
  if: contains(github.event.pull_request.labels.*.name, 'full-test')
  run: turbo run test
```
