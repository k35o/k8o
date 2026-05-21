import type { FC, ReactNode } from 'react';

import { NOTES_ROLE } from '@/features/slides/application/notes-marker';

/**
 * 発表者ノート用マーカー。常に null を返し、本編 DOM には出力されない。
 * split-slides 側は `$$slideRole === NOTES_ROLE` で識別するため、
 * HMR や re-export で関数参照が変わっても判定が壊れない。
 */
type NotesComponent = FC<{ children: ReactNode }> & {
  $$slideRole: typeof NOTES_ROLE;
};

const NotesImpl: FC<{ children: ReactNode }> = () => null;
(NotesImpl as NotesComponent).$$slideRole = NOTES_ROLE;

export const Notes: NotesComponent = NotesImpl as NotesComponent;
