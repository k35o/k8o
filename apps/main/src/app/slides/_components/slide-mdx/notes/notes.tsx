import type { FC, ReactNode } from 'react';

import { NOTES_ROLE } from '@/features/slides/application/notes-marker';

type NotesComponent = FC<{ children: ReactNode }> & {
  $$slideRole: typeof NOTES_ROLE;
};

const NotesImpl: FC<{ children: ReactNode }> = () => null;
// split-slides 側は $$slideRole === NOTES_ROLE（文字列）で識別する。HMR や re-export で
// 関数参照が変わっても判定が壊れないようにするため。
(NotesImpl as NotesComponent).$$slideRole = NOTES_ROLE;

export const Notes: NotesComponent = NotesImpl as NotesComponent;
