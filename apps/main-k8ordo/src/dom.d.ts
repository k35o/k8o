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
