export { Playground } from './playground';
export * from './async-clipboard';
export * from './popover';
export * from './requestclose';
export * from './print-color-adjust';
export * from './screen-wake-lock';
export * from './suspense-list';
export * from './abs-sign';
export * from './highlight';
export * from './spelling-grammar-error';
export type { PlaygroundSection, PlaygroundDemo } from './types';

import { absSignSection } from './abs-sign';
import { asyncClipboardSection } from './async-clipboard';
import { highlightSection } from './highlight';
import { popoverSection } from './popover';
import { printColorAdjustSection } from './print-color-adjust';
import { requestCloseSection } from './requestclose';
import { screenWakeLockSection } from './screen-wake-lock';
import { spellingGrammarErrorSection } from './spelling-grammar-error';
import { suspenseListSection } from './suspense-list';
import { PlaygroundSection } from './types';

export const playgroundSections: PlaygroundSection[] = [
  asyncClipboardSection,
  popoverSection,
  requestCloseSection,
  printColorAdjustSection,
  screenWakeLockSection,
  suspenseListSection,
  absSignSection,
  highlightSection,
  spellingGrammarErrorSection,
];
