const DISPATCH_URL =
  'https://api.github.com/repos/k35o/k8o/actions/workflows/vercel-prebuilt.yml/dispatches';
const TIMEOUT_MS = 5000;

// 失敗しても throw せず false を返す。公開状態の書き込みは済んでいるので、呼び出し元はそれを成功として返し、
// 再ビルドを起こせたかだけを伝える
export async function requestMainRebuild(): Promise<boolean> {
  const token = process.env['MAIN_REBUILD_GITHUB_TOKEN'];
  if (!token) {
    console.warn(
      'MAIN_REBUILD_GITHUB_TOKEN が設定されていないため、main の再ビルドを起こしませんでした',
    );
    return false;
  }
  // 改行などヘッダーに使えない文字があると、fetch が投げる TypeError の文にトークンが
  // まるごと入るので、GitHub を呼ぶ前に値を入れない文で弾く
  if (!/^[A-Za-z0-9_]+$/u.test(token)) {
    console.error(
      'MAIN_REBUILD_GITHUB_TOKEN に英数字と _ のほかの文字（改行など）が入っているため、main の再ビルドを起こしませんでした',
    );
    return false;
  }

  try {
    const res = await fetch(DISPATCH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'api.k8o.me',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: { app: 'main', target: 'production' },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(
        `main の再ビルドを起こせませんでした: GitHub が ${res.status.toString()} を返しました`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error('main の再ビルドを起こせませんでした:', error);
    return false;
  }
}
