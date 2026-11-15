// TypeScript 7.0のDOM型定義にまだariaNotifyが無いため補う
type AriaNotificationOptions = {
  priority?: 'normal' | 'high';
};

interface Element {
  ariaNotify: (announcement: string, options?: AriaNotificationOptions) => void;
}

interface Document {
  ariaNotify: (announcement: string, options?: AriaNotificationOptions) => void;
}

// TypeScript 7.0のDOM型定義はEXT_texture_norm16のinterfaceを持つが、getExtensionの戻り値に結び付けていないため補う
interface WebGLRenderingContextBase {
  // oxlint-disable-next-line typescript/method-signature-style -- lib.domのメソッドにオーバーロードを足せるのは、メソッドの宣言をマージするときだけ
  getExtension(extensionName: 'EXT_texture_norm16'): EXT_texture_norm16 | null;
}

// TypeScript 7.0のDOM型定義にまだTrusted Typesのpolicyが無いため補う。TrustedHTMLは@types/reactが空のinterfaceで置く
type TrustedTypePolicy = {
  createHTML: (input: string) => TrustedHTML;
};

type TrustedTypePolicyFactory = {
  createPolicy: (
    policyName: string,
    policyOptions: { createHTML: (input: string) => string },
  ) => TrustedTypePolicy;
};

interface Window {
  readonly trustedTypes: TrustedTypePolicyFactory;
}
