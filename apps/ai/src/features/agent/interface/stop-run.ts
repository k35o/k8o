import { getAllowedSession } from '@/shared/auth/allowed-session';

import { requestStop } from '../application/threads';

export async function handleStopRequest(threadId: string): Promise<Response> {
  const session = await getAllowedSession();
  if (session === null) {
    return new Response(null, { status: 401 });
  }
  await requestStop({ threadId, userId: session.userId, now: Date.now() });
  return new Response(null, { status: 204 });
}
