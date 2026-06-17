import { db } from '@repo/database';
import { and, eq } from 'drizzle-orm';

type SubscriptionInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  endpointHost: string;
};

// 既存の p256dh/auth を上書きしないことで、endpoint を知る第三者による改ざんを防ぐ。
export const insertSubscription = async (
  input: SubscriptionInput,
): Promise<void> => {
  await db
    .insert(db._schema.pushSubscriptions)
    .values(input)
    .onConflictDoNothing({ target: db._schema.pushSubscriptions.endpoint });
};

// IDOR対策: endpoint を知るだけでは消せないよう auth(共有秘密)の一致も必須にする。
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
