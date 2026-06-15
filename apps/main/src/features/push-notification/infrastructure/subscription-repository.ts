import { db } from '@repo/database';
import { eq } from 'drizzle-orm';

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

export const deleteSubscription = async (endpoint: string): Promise<void> => {
  await db
    .delete(db._schema.pushSubscriptions)
    .where(eq(db._schema.pushSubscriptions.endpoint, endpoint));
};
