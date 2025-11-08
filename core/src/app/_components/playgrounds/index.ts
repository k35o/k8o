export * from './abs-sign';
export * from './async-clipboard';
export * from './details-content';
export * from './highlight';
export * from './input-file-webkitdirectory';
export { Playground } from './playground';
export * from './popover';
export * from './print-color-adjust';
export * from './requestclose';
export * from './screen-wake-lock';
export * from './spelling-grammar-error';
export * from './suspense-list';
export type { PlaygroundDemo, PlaygroundSection } from './types';
export * from './view-transitions';

import { absSignSection } from './abs-sign';
import { asyncClipboardSection } from './async-clipboard';
import { composedRangesSection } from './composed-ranges';
import { detailsContentSection } from './details-content';
import { highlightSection } from './highlight';
import { inputFileWebkitdirectorySection } from './input-file-webkitdirectory';
import { popoverSection } from './popover';
import { printColorAdjustSection } from './print-color-adjust';
import { requestCloseSection } from './requestclose';
import { screenWakeLockSection } from './screen-wake-lock';
import { spellingGrammarErrorSection } from './spelling-grammar-error';
import { suspenseListSection } from './suspense-list';
import type { PlaygroundSection } from './types';
import { viewTransitionsSection } from './view-transitions';

export const playgroundSections: PlaygroundSection[] = [
  asyncClipboardSection,
  composedRangesSection,
  detailsContentSection,
  inputFileWebkitdirectorySection,
  popoverSection,
  requestCloseSection,
  printColorAdjustSection,
  screenWakeLockSection,
  suspenseListSection,
  absSignSection,
  highlightSection,
  spellingGrammarErrorSection,
  viewTransitionsSection,
];
