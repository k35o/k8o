import DOMPurify from 'dompurify';

// @ts-expect-error Trusted Types APIの型定義が未提供
let policy: TrustedTypePolicy | undefined;

export const getHTMLPolicy = (): typeof policy => {
  if (typeof window === 'undefined' || !window['trustedTypes']) {
    return;
  }
  if (policy) {
    return policy;
  }
  policy = window['trustedTypes'].createPolicy('k8o', {
    createHTML: (input: string) => DOMPurify.sanitize(input),
  });
  return policy;
};
