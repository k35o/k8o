// CSS.supports を差し替えると部品の CSS の分岐まで変わるので、検出する機能のうち描画に関わらない autocorrect を外す
export const lackBaseline = (): (() => void) => {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'autocorrect',
  );
  if (descriptor === undefined) {
    throw new Error('HTMLElement.prototype.autocorrect が無い');
  }
  Reflect.deleteProperty(HTMLElement.prototype, 'autocorrect');
  return () => {
    Object.defineProperty(HTMLElement.prototype, 'autocorrect', descriptor);
  };
};
