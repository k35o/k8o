import 'server-only';
import { auth } from '@repo/database';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const isAuthEnabled = process.env['VERCEL_ENV'] !== 'preview';

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
