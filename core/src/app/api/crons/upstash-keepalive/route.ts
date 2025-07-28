import 'server-only';

import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // CRON_SECRET による認証
  if (
    !process.env.CRON_SECRET ||
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const redis = Redis.fromEnv();

    // keepalive用の軽量な操作を実行
    const key = 'keepalive:last-ping';
    const timestamp = new Date().toISOString();

    // キーを設定（24時間で期限切れ）
    await redis.setex(key, 86400, timestamp);

    // 設定したキーを読み取って接続を確認
    const result = await redis.get(key);

    if (result === timestamp) {
      console.log(`Upstash keepalive successful at ${timestamp}`);
      return NextResponse.json({
        ok: true,
        timestamp,
        message: 'Upstash keepalive ping successful'
      });
    } else {
      console.error('Upstash keepalive failed: timestamp mismatch');
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  } catch (error) {
    console.error('Upstash keepalive error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}