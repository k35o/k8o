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

let policy: TrustedTypePolicy | undefined;

export const getHTMLPolicy = (): typeof policy => {
  const trustedTypes =
    typeof window === 'undefined'
      ? undefined
      : (window as Window & { trustedTypes?: TrustedTypes }).trustedTypes;

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
