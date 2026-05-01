/* oxlint-disable import/max-dependencies -- Playground一覧の単一レジストリとして各デモを集約するため */

export * from './abs-sign';
export * from './active-view-transition';
export * from './async-clipboard';
export * from './caret-position-from-point';
export * from './composed-ranges';
export * from './content-visibility';
export * from './details-content';
export * from './event-timing';
export * from './font-family-math';
export * from './highlight';
export * from './input-file-webkitdirectory';
export * from './invoker-commands';
export * from './largest-contentful-paint';
export { Playground } from './playground';
export * from './popover';
export * from './print-color-adjust';
export * from './requestclose';
export * from './root-font-units';
export * from './scope';
export * from './screen-wake-lock';
export * from './scrollbar-color';
export * from './scrollend';
export * from './shape-function';
export * from './spelling-grammar-error';
export * from './suspense-list';
export * from './text-indent-keywords';
export * from './view-transitions';

import { absSignSection } from './abs-sign';
import { activeViewTransitionSection } from './active-view-transition';
import { asyncClipboardSection } from './async-clipboard';
import { caretPositionFromPointSection } from './caret-position-from-point';
import { composedRangesSection } from './composed-ranges';
import { contentVisibilitySection } from './content-visibility';
import { detailsContentSection } from './details-content';
import { eventTimingSection } from './event-timing';
import { fontFamilyMathSection } from './font-family-math';
import { highlightSection } from './highlight';
import { inputFileWebkitdirectorySection } from './input-file-webkitdirectory';
import { invokerCommandsSection } from './invoker-commands';
import { lcpSection } from './largest-contentful-paint';
import { popoverSection } from './popover';
import { printColorAdjustSection } from './print-color-adjust';
import { requestCloseSection } from './requestclose';
import { rootFontUnitsSection } from './root-font-units';
import { scopeSection } from './scope';
import { screenWakeLockSection } from './screen-wake-lock';
import { scrollbarColorSection } from './scrollbar-color';
import { scrollendSection } from './scrollend';
import { shapeFunctionSection } from './shape-function';
import { spellingGrammarErrorSection } from './spelling-grammar-error';
import { suspenseListSection } from './suspense-list';
import { textIndentKeywordsSection } from './text-indent-keywords';
import type { PlaygroundSection } from './types';
import { viewTransitionsSection } from './view-transitions';

export const playgroundSections: PlaygroundSection[] = [
  activeViewTransitionSection,
  asyncClipboardSection,
  caretPositionFromPointSection,
  composedRangesSection,
  contentVisibilitySection,
  detailsContentSection,
  eventTimingSection,
  fontFamilyMathSection,
  inputFileWebkitdirectorySection,
  invokerCommandsSection,
  lcpSection,
  popoverSection,
  requestCloseSection,
  printColorAdjustSection,
  rootFontUnitsSection,
  scopeSection,
  screenWakeLockSection,
  scrollbarColorSection,
  scrollendSection,
  suspenseListSection,
  absSignSection,
  highlightSection,
  shapeFunctionSection,
  spellingGrammarErrorSection,
  textIndentKeywordsSection,
  viewTransitionsSection,
];
