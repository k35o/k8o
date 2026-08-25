'use server';

import { verifySession } from '@/shared/auth/verify-session';

export async function okAction(): Promise<void> {
  await verifySession();
}

export async function ngMissingAction(): Promise<void> {
  await Promise.resolve();
}

export async function ngNotFirstAction(): Promise<void> {
  await Promise.resolve();
  await verifySession();
}

export const okArrowAction = async (): Promise<void> => {
  await verifySession();
};

const ngNamedAction = async (): Promise<void> => {
  await Promise.resolve();
};
export { ngNamedAction };

export const ngWrappedAction = withMiddleware(async (): Promise<void> => {
  await verifySession();
});
