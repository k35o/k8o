import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { requestStop } from '../application/threads';

export async function handleStopRequest(
  req: Request,
  threadId: string,
): Promise<Response> {
  const session = await requireAllowedSession(req.headers);
  if (session === null) {
    return new Response(null, { status: 401 });
  }
  await requestStop({ threadId, userId: session.userId, now: Date.now() });
  return new Response(null, { status: 204 });
}
