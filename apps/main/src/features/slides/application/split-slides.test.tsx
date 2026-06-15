import React, { type FC, type ReactNode } from 'react';

import { NOTES_ROLE } from './notes-marker';
import { splitSlides } from './split-slides';

// vitest の JSX classic transform 用に React を scope に置く
void React;

type NotesComponent = FC<{ children: ReactNode }> & {
  $$slideRole: typeof NOTES_ROLE;
};
const NotesImpl: FC<{ children: ReactNode }> = () => null;
(NotesImpl as NotesComponent).$$slideRole = NOTES_ROLE;
const TestNotes = NotesImpl as NotesComponent;

const FakeNotes: FC = () => null;

describe('splitSlides', () => {
  describe('正常系', () => {
    it('hr で区切らない場合は 1 枚のスライドになる', () => {
      const children = [<h2 key="1">title</h2>, <p key="2">body</p>];
      const slides = splitSlides(children);
      expect(slides).toHaveLength(1);
      expect(slides[0]?.content).toHaveLength(2);
      expect(slides[0]?.notes).toHaveLength(0);
    });

    it('hr 要素ごとにスライドを分割する', () => {
      const children = [
        <h2 key="1">1</h2>,
        <hr key="hr1" />,
        <h2 key="2">2</h2>,
        <hr key="hr2" />,
        <h2 key="3">3</h2>,
      ];
      const slides = splitSlides(children);
      expect(slides).toHaveLength(3);
      expect(slides[0]?.content).toHaveLength(1);
      expect(slides[1]?.content).toHaveLength(1);
      expect(slides[2]?.content).toHaveLength(1);
    });

    it('Notes は content に含まれず notes に集められる', () => {
      const children = [
        <h2 key="1">title</h2>,
        <TestNotes key="n1">メモ1</TestNotes>,
        <p key="2">body</p>,
        <TestNotes key="n2">メモ2</TestNotes>,
      ];
      const slides = splitSlides(children);
      expect(slides).toHaveLength(1);
      expect(slides[0]?.content).toHaveLength(2);
      expect(slides[0]?.notes).toEqual(['メモ1', 'メモ2']);
    });

    it('Notes は所属するスライドにだけ振り分けられる', () => {
      const children = [
        <h2 key="1">1</h2>,
        <TestNotes key="n1">1のメモ</TestNotes>,
        <hr key="hr" />,
        <h2 key="2">2</h2>,
        <TestNotes key="n2">2のメモ</TestNotes>,
      ];
      const slides = splitSlides(children);
      expect(slides[0]?.notes).toEqual(['1のメモ']);
      expect(slides[1]?.notes).toEqual(['2のメモ']);
    });
  });

  describe('エッジケース', () => {
    it('children が空でも 1 枚の空スライドを返す', () => {
      const slides = splitSlides(null);
      expect(slides).toHaveLength(1);
      expect(slides[0]?.content).toHaveLength(0);
      expect(slides[0]?.notes).toHaveLength(0);
    });

    it('hr のみでも区切り通りに空スライドを生成', () => {
      const children = [<hr key="1" />, <hr key="2" />];
      const slides = splitSlides(children);
      expect(slides).toHaveLength(3);
    });

    it('$$slideRole がない関数コンポーネントは content 扱い', () => {
      const children = [<h2 key="1">title</h2>, <FakeNotes key="2" />];
      const slides = splitSlides(children);
      expect(slides[0]?.content).toHaveLength(2);
      expect(slides[0]?.notes).toHaveLength(0);
    });
  });
});
