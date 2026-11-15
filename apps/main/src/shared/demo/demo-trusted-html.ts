// 記事が例の文書を iframe の srcdoc に入れるときの Trusted Types の policy。記事の CSP の trusted-types は
// この名前だけを許す
export const DEMO_TRUSTED_TYPES_POLICY = 'k8o-demo';

let policy: TrustedTypePolicy | undefined;

// 例の文書は、記事と同じ origin の route が記事の MDX から書いたものなので、手を加えずに通す。policy は
// ブラウザでしか作れず、同じ名前で二度作ると違反になるので、初めて使うときに一度だけ作る
export const toDemoTrustedHTML = (html: string): TrustedHTML => {
  policy ??= window.trustedTypes.createPolicy(DEMO_TRUSTED_TYPES_POLICY, {
    createHTML: (input) => input,
  });
  return policy.createHTML(html);
};
