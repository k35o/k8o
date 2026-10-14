import { handleChat } from '@/features/agent/interface/chat';

export const maxDuration = 800;

export function POST(req: Request): Promise<Response> {
  return handleChat(req);
}
