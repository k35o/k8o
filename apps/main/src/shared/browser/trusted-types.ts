import DOMPurify from 'dompurify';

type TrustedTypePolicy = {
  createHTML: (input: string) => string;
};

type TrustedTypes = {
  createPolicy: (
    name: string,
    rules: { createHTML: (input: string) => string },
  ) => TrustedTypePolicy;
};

declare global {
  // TS lib.dom が Trusted Types API を取り込んだら削除
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation には interface が必要
  interface Window {
    trustedTypes?: TrustedTypes;
  }
}

let policy: TrustedTypePolicy | undefined;

export const getHTMLPolicy = (): typeof policy => {
  const trustedTypes =
    typeof window === 'undefined' ? undefined : window.trustedTypes;

  if (!trustedTypes) {
    return undefined;
  }
  if (policy) {
    return policy;
  }
  policy = trustedTypes.createPolicy('k8o', {
    createHTML: (input: string) => DOMPurify.sanitize(input),
  });
  return policy;
};
