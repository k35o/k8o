import { handleGenerate } from '@/features/generation/interface/generate';

export function POST(req: Request): Promise<Response> {
  return handleGenerate(req);
}
