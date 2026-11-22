// 版は UA から取れない（iOS は固定値、iPad の Firefox は Mac の Safari を名乗る）。全機能も調べない。
// 各ブラウザの最低版を決めた機能があれば、それより前に入った Baseline の機能は揃っている。
export const BASELINE_PROBES: Record<string, () => boolean> = {
  autocorrect: () => 'autocorrect' in HTMLElement.prototype,
  'scroll-driven-animations': () =>
    CSS.supports('animation-timeline', 'scroll()'),
  'revert-rule': () => CSS.supports('color', 'revert-rule'),
};

/** これまでに Baseline に入った機能に、このブラウザが対応しているか。ブラウザでだけ呼べる */
export const supportsBaseline = (): boolean =>
  Object.values(BASELINE_PROBES).every((probe) => probe());
