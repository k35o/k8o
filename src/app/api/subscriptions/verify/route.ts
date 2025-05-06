import { verifyEmail } from '@/services/subscriptions/verify';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  if (!email || !token) {
    return new Response('Invalid request', { status: 400 });
  }

  const result = await verifyEmail(decodeURIComponent(email), token);

  if (!result.success) {
    redirect(
      `/subscriptions?status=false&message=${encodeURIComponent(result.message)}`,
    );
  }

  redirect('/subscriptions?status=true');
}
