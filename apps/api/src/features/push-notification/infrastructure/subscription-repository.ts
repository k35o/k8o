import { db } from '@repo/database';
import { and, eq } from '@repo/database/orm';

// 既存の p256dh と auth は上書きしない。endpoint を知るだけの第三者が鍵を差し替えられないように
export const insertSubscription = async (subscription: {
  endpoint: string;
  endpointHost: string;
  p256dh: string;
  auth: string;
}): Promise<void> => {
  await db
    .insert(db._schema.pushSubscriptions)
    .values(subscription)
    .onConflictDoNothing({ target: db._schema.pushSubscriptions.endpoint });
};

// endpoint を知るだけでは消せないよう、共有の秘密の auth の一致も条件にする
export const deleteSubscription = async (
  endpoint: string,
  auth: string,
): Promise<void> => {
  await db
    .delete(db._schema.pushSubscriptions)
    .where(
      and(
        eq(db._schema.pushSubscriptions.endpoint, endpoint),
        eq(db._schema.pushSubscriptions.auth, auth),
      ),
    );
};
