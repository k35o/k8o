import type { FC, ReactNode } from 'react';

import { NOTES_ROLE } from '@/components/slides/split-slides/notes-marker';

type NotesComponent = FC<{ children: ReactNode }> & {
  $$slideRole: typeof NOTES_ROLE;
};

const NotesImpl: FC<{ children: ReactNode }> = () => null;
// split-slides 側は $$slideRole === NOTES_ROLE（文字列）で識別する。HMR や re-export で
// 関数参照が変わっても判定が壊れないようにするため。
(NotesImpl as NotesComponent).$$slideRole = NOTES_ROLE;

// 関数の宣言や式で export しない。このモジュールが CSS を import すると、plugin-rsc がそれを
// CSS を載せる包みの関数に替え、$$slideRole が外れてノートが本文に出る
export const Notes: NotesComponent = NotesImpl as NotesComponent;
