import { describe, expect, it } from 'vitest';

import { createProjectHeading } from './project-heading';

describe('createProjectHeading', () => {
  describe('正常系', () => {
    it('開いた直後は新規に向かっていて、?project= の無い URL には追従しない', () => {
      const heading = createProjectHeading();

      expect(heading.isHeadingTo(null)).toBe(true);
    });

    it('読み込みを始めたプロジェクトへは、URL がそれを指しても追従しない', () => {
      const heading = createProjectHeading();

      heading.moveTo(5);

      expect(heading.isHeadingTo(5)).toBe(true);
      expect(heading.isHeadingTo(null)).toBe(false);
    });

    it('読み込みを待つあいだに移らなければ、読み込んだ結果を当てはめる', () => {
      const heading = createProjectHeading();

      const loading = heading.moveTo(5);

      expect(loading()).toBe(true);
    });

    it.each([
      ['新規', null],
      ['既存のプロジェクト', 5],
    ] as const)(
      '%sの保存を待つあいだに移らなければ、保存の結果を当てはめる',
      (_label, projectId) => {
        const heading = createProjectHeading();
        heading.moveTo(projectId);

        const saving = heading.stayAt(projectId);

        expect(saving()).toBe(true);
      },
    );
  });

  describe('エッジケース', () => {
    it('読み込みを待つあいだに、戻る操作で前のプロジェクトへ移ったら、遅れて返った読み込みは当てはめない', () => {
      const heading = createProjectHeading();
      heading.moveTo(5);
      const loading = heading.moveTo(6);

      heading.moveTo(5);

      expect(loading()).toBe(false);
    });

    it('読み込みを待つあいだに新規作成で新規に戻ったら、遅れて返った読み込みは当てはめない', () => {
      const heading = createProjectHeading();
      const loading = heading.moveTo(5);

      heading.moveTo(null);

      expect(loading()).toBe(false);
    });

    it('保存を待つあいだに一覧で別のプロジェクトを選んだら、保存の結果は当てはめない', () => {
      const heading = createProjectHeading();
      const saving = heading.stayAt(null);

      heading.moveTo(3);

      expect(saving()).toBe(false);
    });

    it('保存を待つあいだに別のプロジェクトを経て同じプロジェクトへ戻っても、保存の結果は当てはめない', () => {
      const heading = createProjectHeading();
      heading.moveTo(5);
      const saving = heading.stayAt(5);

      heading.moveTo(3);
      heading.moveTo(5);

      expect(saving()).toBe(false);
    });

    it('別のプロジェクトの読み込みを待つあいだに今のプロジェクトの保存を始めたら、保存の結果は当てはめない', () => {
      const heading = createProjectHeading();
      heading.moveTo(5);
      heading.moveTo(6);

      const saving = heading.stayAt(5);

      expect(saving()).toBe(false);
    });
  });
});
