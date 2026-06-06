import 'server-only';
import { auth } from '@repo/database/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { isAuthEnabled } from './auth-enabled';

export const verifySession = async (): Promise<void> => {
  if (!isAuthEnabled) {
    return;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }
};
