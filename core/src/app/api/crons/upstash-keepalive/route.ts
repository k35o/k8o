import 'server-only';

import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // CRON_SECRET による認証チェック
  if (
    !process.env.CRON_SECRET ||
    req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const redis = Redis.fromEnv();
    
    // Upstash Redis に軽量な操作を実行してconnectionを維持
    const timestamp = new Date().toISOString();
    const key = 'keepalive:last-ping';
    
    // pingの代わりに一時的なキーを設定
    await redis.set(key, timestamp, { ex: 60 * 60 * 24 }); // 24時間で期限切れ
    
    // キーが正常に設定されたかを確認
    const result = await redis.get(key);
    
    if (result === timestamp) {
      console.log(`Upstash keepalive successful at ${timestamp}`);
      return NextResponse.json({ 
        ok: true, 
        timestamp,
        message: 'Upstash Redis connection kept alive'
      });
    } else {
      throw new Error('Failed to verify Redis operation');
    }
  } catch (error) {
    console.error('Upstash keepalive failed:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}