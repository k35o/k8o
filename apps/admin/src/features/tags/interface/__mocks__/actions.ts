import type { ActionState } from '@/shared/actions/action-state';

export const createTag = (
  _prev: ActionState,
  _formData: FormData,
): Promise<ActionState> => Promise.resolve({ success: true });

export const renameTag = (_id: number, _name: string): Promise<ActionState> =>
  Promise.resolve({ success: true });

export const deleteTag = (_id: number): Promise<ActionState> =>
  Promise.resolve({ success: true });
