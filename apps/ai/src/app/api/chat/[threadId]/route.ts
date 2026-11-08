import { handleThreadSnapshot } from '@/features/agent/interface/thread-snapshot';

export async function GET(
  _req: Request,
  ctx: RouteContext<'/api/chat/[threadId]'>,
): Promise<Response> {
  const { threadId } = await ctx.params;
  return handleThreadSnapshot(threadId);
}
