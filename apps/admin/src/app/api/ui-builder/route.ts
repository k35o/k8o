import { handleUiBuilderChat } from '@/features/ui-builder/interface/chat';

// ストリーミング生成のため、実行時間の上限を緩める。
export const maxDuration = 60;

export function POST(req: Request): Promise<Response> {
  return handleUiBuilderChat(req);
}
