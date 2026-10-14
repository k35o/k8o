import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import { getThreadSnapshot } from '../application/threads';

export async function handleThreadSnapshot(
  req: Request,
  threadId: string,
): Promise<Response> {
  const session = await requireAllowedSession(req.headers);
  if (session === null) {
    return new Response(null, { status: 401 });
  }
  const snapshot = await getThreadSnapshot({
    threadId,
    userId: session.userId,
    now: Date.now(),
  });
  if (snapshot === null) {
    return new Response(null, { status: 404 });
  }
  return Response.json(snapshot);
}
