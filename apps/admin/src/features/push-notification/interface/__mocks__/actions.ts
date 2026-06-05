import type { ActionState } from '@/shared/actions/action-state';

type ManualPushActionState = ActionState & {
  succeeded?: number;
  failed?: number;
};

export const sendManualPushAction = (_input: {
  title: string;
  body: string;
  url: string;
}): Promise<ManualPushActionState> =>
  Promise.resolve({ success: true, succeeded: 1, failed: 0 });
