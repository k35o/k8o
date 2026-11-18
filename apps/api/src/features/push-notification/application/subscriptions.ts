import { isAllowedPushEndpoint } from '../infrastructure/is-allowed-push-endpoint';
import { insertSubscription } from '../infrastructure/subscription-repository';
import { importSubscriptionKeys } from '../infrastructure/web-push';

type SubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type SubscriptionRejection = 'endpoint_not_allowed' | 'invalid_keys';

export const rejectSubscription = async ({
  endpoint,
  keys,
}: SubscriptionInput): Promise<SubscriptionRejection | null> => {
  // SSRF 対策: 通知を送る先は、Push サービスの https のホストに限る
  if (!isAllowedPushEndpoint(endpoint)) {
    return 'endpoint_not_allowed';
  }
  return (await importSubscriptionKeys(keys)) === null ? 'invalid_keys' : null;
};

export const subscribe = ({
  endpoint,
  keys,
}: SubscriptionInput): Promise<void> =>
  insertSubscription({
    endpoint,
    endpointHost: new URL(endpoint).hostname,
    p256dh: keys.p256dh,
    auth: keys.auth,
  });

export { deleteSubscription as unsubscribe } from '../infrastructure/subscription-repository';
