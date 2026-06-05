import type { ActionState } from '@/shared/actions/action-state';

export const deleteComment = (_id: number): Promise<ActionState> =>
  Promise.resolve({ success: true });
