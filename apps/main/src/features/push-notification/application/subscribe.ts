import {
  deleteSubscription,
  insertSubscription,
} from '../infrastructure/subscription-repository';

type SubscribeInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export const subscribePush = async (input: SubscribeInput): Promise<void> => {
  // endpoint は interface 層で検証済みのため URL として解析できる
  const endpointHost = new URL(input.endpoint).hostname;
  await insertSubscription({ ...input, endpointHost });
};

type UnsubscribeInput = {
  endpoint: string;
  auth: string;
};

export const unsubscribePush = async (
  input: UnsubscribeInput,
): Promise<void> => {
  await deleteSubscription(input.endpoint, input.auth);
};
