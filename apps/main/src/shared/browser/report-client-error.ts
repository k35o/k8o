const MAX_STACK_LENGTH = 4096;

type ClientError = Error & { digest?: string };

export const reportClientError = (error: ClientError): void => {
  const report = {
    type: 'client-error',
    age: 0,
    url: window.location.href,
    user_agent: window.navigator.userAgent,
    body: {
      name: error.name,
      message: error.message,
      digest: error.digest,
      stack: error.stack?.slice(0, MAX_STACK_LENGTH),
    },
  };

  // 送信失敗で新たなエラーを発生させないよう fire-and-forget で送る
  window.navigator.sendBeacon(
    '/api/reports',
    new Blob([JSON.stringify([report])], { type: 'application/json' }),
  );
};
