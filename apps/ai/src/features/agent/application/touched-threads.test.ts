import { describe, expect, it } from 'vitest';

import type { ThreadListItem } from './threads';
import { withTouchedThreads } from './touched-threads';

const older: ThreadListItem = {
  id: 'older',
  title: '前の会話',
  model: 'claude-sonnet-5-5',
  updatedAt: '2026-10-13T12:00:00.000Z',
  running: false,
};

const newer: ThreadListItem = {
  id: 'newer',
  title: '最近の会話',
  model: 'claude-opus-5-5',
  updatedAt: '2026-10-14T00:00:00.000Z',
  running: false,
};

describe('withTouchedThreads', () => {
  describe('正常系', () => {
    it('このタブで作ったスレッドが、サーバーの一覧の先頭に入る', () => {
      const created: ThreadListItem = {
        id: 'created',
        title: '新しい会話',
        model: 'claude-sonnet-5-5',
        updatedAt: '2026-10-14T01:00:00.000Z',
        running: true,
      };
      expect(withTouchedThreads([newer, older], [created])).toStrictEqual([
        created,
        newer,
        older,
      ]);
    });

    it('サーバーより新しく触ったスレッドは、触ったほうの生成中の印を出して先頭へ移す', () => {
      const sent: ThreadListItem = {
        ...older,
        updatedAt: '2026-10-14T01:00:00.000Z',
        running: true,
      };
      expect(withTouchedThreads([newer, older], [sent])).toStrictEqual([
        sent,
        newer,
      ]);
    });

    it('サーバーのほうが新しければ、サーバーの行を採る', () => {
      const touched: ThreadListItem = {
        ...newer,
        updatedAt: '2026-10-13T23:00:00.000Z',
        running: true,
      };
      expect(withTouchedThreads([newer, older], [touched])).toStrictEqual([
        newer,
        older,
      ]);
    });
  });

  describe('エッジケース', () => {
    it('触ったスレッドが無ければ、サーバーの一覧のまま', () => {
      expect(withTouchedThreads([newer, older], [])).toStrictEqual([
        newer,
        older,
      ]);
    });

    it('サーバーの一覧が空なら、触ったスレッドだけを新しい順に並べる', () => {
      expect(withTouchedThreads([], [older, newer])).toStrictEqual([
        newer,
        older,
      ]);
    });

    it('更新日時が同じなら、サーバーの行を採る', () => {
      const touched: ThreadListItem = { ...newer, running: true };
      expect(withTouchedThreads([newer], [touched])).toStrictEqual([newer]);
    });

    it('同じスレッドを何度も触ったら、いちばん新しい行だけを残す', () => {
      const sent: ThreadListItem = {
        ...older,
        updatedAt: '2026-10-14T01:00:00.000Z',
        running: true,
      };
      const finished: ThreadListItem = {
        ...older,
        updatedAt: '2026-10-14T01:05:00.000Z',
        running: false,
      };
      expect(withTouchedThreads([], [finished, sent])).toStrictEqual([
        finished,
      ]);
    });
  });
});
