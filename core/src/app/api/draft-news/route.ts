import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const draftKey = searchParams.get('draft-key');

  if (secret !== process.env.MICROCMS_API_KEY || !draftKey) {
    return new Response('Invalid token', { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect('/news?draftKey=' + draftKey);
}
