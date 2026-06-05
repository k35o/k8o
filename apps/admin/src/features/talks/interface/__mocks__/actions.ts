import type { ActionState } from '@/shared/actions/action-state';

export const createTalk = (
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> => Promise.resolve({ success: true });

export const updateTalk = (
  _id: number,
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> => Promise.resolve({ success: true });

export const deleteTalk = (_id: number): Promise<ActionState> =>
  Promise.resolve({ success: true });
