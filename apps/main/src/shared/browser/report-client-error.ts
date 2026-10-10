import { publicApi } from '@/shared/api/public-api';

const MAX_STACK_LENGTH = 4096;

type ClientError = Error & { digest?: string };

export const reportClientError = (clientError: ClientError): void => {
  const report = {
    type: 'client-error',
    age: 0,
    url: window.location.href,
    user_agent: window.navigator.userAgent,
    body: {
      name: clientError.name,
      message: clientError.message,
      digest: clientError.digest,
      stack: clientError.stack?.slice(0, MAX_STACK_LENGTH),
    },
  };

  // sendBeacon は資格情報付きで送るため、別オリジンの api のプリフライトに通らない。
  // 代わりにページを離れても送り切れる keepalive の fetch で送る
  void publicApi.public.reports
    .$post({ json: [report] }, { init: { keepalive: true } })
    .catch(() => {
      // 送信の失敗で新たなエラーを起こさないよう握りつぶす
    });
};
