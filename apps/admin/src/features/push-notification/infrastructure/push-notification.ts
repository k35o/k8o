export async function sendPushNotification(
  title: string,
  body: string,
  url: string,
): Promise<void> {
  const apiKey = process.env['K8O_PUSH_API_KEY'];
  if (apiKey === undefined || apiKey === '') {
    console.warn('K8O_PUSH_API_KEY が設定されていません');
    return;
  }

  const response = await fetch('https://api.push.k8o.me/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({ title, body, url }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`k8o-push APIエラー (${response.status}): ${errorText}`);
  }
}
