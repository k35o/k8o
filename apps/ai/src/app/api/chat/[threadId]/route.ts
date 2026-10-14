import { handleThreadSnapshot } from '@/features/agent/interface/thread-snapshot';

export async function GET(
  req: Request,
  ctx: RouteContext<'/api/chat/[threadId]'>,
): Promise<Response> {
  const { threadId } = await ctx.params;
  return handleThreadSnapshot(req, threadId);
}
