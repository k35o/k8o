import type { BaselineFeature } from '@repo/helpers/baseline/model';
import { describe, expect, it } from 'vitest';

import { diffBaselineFeatures } from './baseline-diff';
import {
  discoveryFailedAlert,
  formatBrokenAlert,
  invariantRejectedAlert,
  majorChangedAlert,
  minVersionsChangedAlert,
  updateNotification,
  upstreamStaleAlert,
  warningAlert,
} from './sync-notifications';

const feature = (
  featureId: string,
  status: BaselineFeature['status'],
): BaselineFeature => ({
  featureId,
  name: featureId,
  status,
  baselineDate: status === 'limited' ? null : '2026-01-01',
  resolvedDate: '2026-01-01',
  support: [],
});

describe('同期の通知', () => {
  describe('正常系', () => {
    it('更新の通知は、到達と遷移の件数を本文に並べ、版ごとの dedupeKey を持つ', () => {
      const diff = diffBaselineFeatures(
        [
          feature('a', 'newly'),
          feature('b', 'newly'),
          feature('c', 'widely'),
          feature('d', 'widely'),
        ],
        [feature('d', 'newly')],
      );

      expect(updateNotification('3.2.0', diff)).toStrictEqual({
        kind: 'update',
        title: 'Browser Support更新',
        body: 'Newly: 2件、Widely: 1件、ステータス変更: 1件',
        dedupeKey: 'browser-support:v3.2.0',
      });
    });

    it('バージョン発見の失敗は、日付ごとの dedupeKey を持つ', () => {
      expect(
        discoveryFailedAlert(
          'Location が想定外',
          new Date('2026-07-02T23:59:59Z'),
        ),
      ).toStrictEqual({
        kind: 'alert',
        title: 'Browser Support同期: バージョン発見に失敗',
        body: 'Location が想定外',
        dedupeKey: 'browser-support:alert:discovery:2026-07-02',
      });
    });

    it('メジャーバージョンの変化は、メジャーごとの dedupeKey を持つ', () => {
      expect(majorChangedAlert('4.0.1', 4)).toStrictEqual({
        kind: 'alert',
        title: 'Browser Support同期: 上流メジャーバージョン変化',
        body: 'web-features v4.0.1 が公開されています。変換・検証の対応後に SUPPORTED_MAJOR を更新してください。それまで前回データで表示を継続します。',
        dedupeKey: 'browser-support:alert:major:v4',
      });
    });

    it('上流の停滞は、日数と現行の版を本文に入れる', () => {
      expect(upstreamStaleAlert('3.2.0', 45)).toStrictEqual({
        kind: 'alert',
        title: 'Browser Support同期: 上流リリースが停滞',
        body: 'web-features が 45 日以上更新されていません(現行 v3.2.0)。上流の動向を確認してください。',
        dedupeKey: 'browser-support:alert:stale:v3.2.0',
      });
    });

    it('フォーマットの変化は、変換の失敗の理由を本文に入れる', () => {
      expect(
        formatBrokenAlert('3.2.0', 'features がオブジェクトではない'),
      ).toStrictEqual({
        kind: 'alert',
        title: 'Browser Support同期: 上流フォーマットの破壊的変化',
        body: 'v3.2.0 の変換に失敗しました: features がオブジェクトではない',
        dedupeKey: 'browser-support:alert:format:v3.2.0',
      });
    });

    it('検証での拒否は、違反の内容を本文に入れる', () => {
      expect(
        invariantRejectedAlert('3.2.0', '番人featureが見つからない: grid'),
      ).toStrictEqual({
        kind: 'alert',
        title: 'Browser Support同期: 検証で拒否',
        body: 'v3.2.0: 番人featureが見つからない: grid',
        dedupeKey: 'browser-support:alert:invariant:v3.2.0',
      });
    });

    it('最低対応バージョンの変化は、版ごとの dedupeKey を持つ', () => {
      expect(minVersionsChangedAlert('3.2.0')).toStrictEqual({
        kind: 'alert',
        title: 'Browser Support: 最低対応バージョンが変化',
        body: 'v3.2.0 でブラウザ最低版フロアが変わりました。外形監視が再生成PRを自動で作成し、CI通過後にマージされます。',
        dedupeKey: 'browser-support:alert:min-versions:v3.2.0',
      });
    });

    it('警告は、複数あれば / で区切って本文に並べる', () => {
      expect(
        warningAlert('3.2.0', [
          'minVersionsが下がった: chrome 120 -> 100',
          'minVersionsが下がった: safari 17.2 -> 17.0',
        ]),
      ).toStrictEqual({
        kind: 'alert',
        title: 'Browser Support同期: 警告',
        body: 'v3.2.0: minVersionsが下がった: chrome 120 -> 100 / minVersionsが下がった: safari 17.2 -> 17.0',
        dedupeKey: 'browser-support:alert:warning:v3.2.0',
      });
    });
  });

  describe('エッジケース', () => {
    it('更新の通知の本文は、0件の項目を省く', () => {
      const diff = diffBaselineFeatures(
        [feature('a', 'widely')],
        [feature('a', 'newly')],
      );

      expect(updateNotification('3.2.0', diff).body).toBe(
        'ステータス変更: 1件',
      );
    });
  });
});
