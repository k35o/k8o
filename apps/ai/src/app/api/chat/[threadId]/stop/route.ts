import { handleStopRequest } from '@/features/agent/interface/stop-run';

export async function POST(
  req: Request,
  ctx: RouteContext<'/api/chat/[threadId]/stop'>,
): Promise<Response> {
  const { threadId } = await ctx.params;
  return handleStopRequest(req, threadId);
}
