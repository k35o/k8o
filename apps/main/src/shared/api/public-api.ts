import type { PublicApi } from '@repo/api/public';
import { hc } from 'hono/client';

// api は本番の k8o.me からの呼び出しだけを受けるので、preview やローカルの main からの
// 書き込みは Origin で拒否される
export const publicApi = hc<PublicApi>('https://api.k8o.me');
