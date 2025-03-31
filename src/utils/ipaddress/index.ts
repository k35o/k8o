import { ipAddress as vercelIpAddress } from '@vercel/functions';

export const ipAddress = (
  req: Request | Headers,
): string | undefined => {
  // Cloudflareを経由するとCF-Connecting-IPヘッダーにユーザーのIPアドレスが入っている
  const headers = 'headers' in req ? req.headers : req;
  const cfConnectingIp = headers.get('CF-Connecting-IP');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xForwardedFor = headers.get('X-Forwarded-For');
  const xForwardedForIp = xForwardedFor?.split(',')[0];
  if (xForwardedForIp) {
    return xForwardedForIp.trim();
  }

  const ip = vercelIpAddress(req);
  return ip;
};
