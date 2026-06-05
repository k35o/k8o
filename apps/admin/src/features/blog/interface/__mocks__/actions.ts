import type { ActionState } from '@/shared/actions/action-state';

export const setBlogPublished = (
  _id: number,
  _published: boolean,
): Promise<ActionState> => Promise.resolve({ success: true });
