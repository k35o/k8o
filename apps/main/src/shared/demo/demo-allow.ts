// 記事の動く例の iframe の allow 属性。権限は、コードブロックのメタの allow に書いた例にだけ渡す。
// ブラウザの許可はサイトに対して残るので、どの例にも渡すと、一度許可した読者のクリップボードを
// ほかの記事の例も読める。
// 例の文書は origin を持たない。allow の既定の相手（src）に当たらず、Firefox と Safari は
// screen-wake-lock を渡さないので、* を書く。クリップボードは * が無くても Chrome が渡し、Firefox と
// Safari は allow を見ないので、* を書かない（iframe が別の文書へ移っても渡らない）
const ALLOW_BY_PERMISSION: Readonly<Record<string, string>> = {
  'clipboard-read': 'clipboard-read',
  'clipboard-write': 'clipboard-write',
  'screen-wake-lock': 'screen-wake-lock *',
};

export const toDemoAllow = (
  permissions: string | undefined,
): string | undefined => {
  const allowed = (permissions ?? '')
    .split(' ')
    .flatMap((permission) => ALLOW_BY_PERMISSION[permission] ?? []);
  return allowed.length === 0 ? undefined : allowed.join('; ');
};
