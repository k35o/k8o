/* oxlint-disable import/max-dependencies -- Playground一覧の単一レジストリとして各デモを集約するため */

export * from './abs-sign';
export * from './active-view-transition';
export * from './async-clipboard';
export * from './baseline-shift';
export * from './caret-position-from-point';
export * from './composed-ranges';
export * from './container-style-queries';
export * from './content-visibility';
export * from './contrast-color';
export * from './crisp-edges';
export * from './details-content';
export * from './event-timing';
export * from './field-sizing';
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
export * from './open-pseudo';
export * from './shape-function';
export * from './shared-worker';
export * from './spelling-grammar-error';
export * from './suspense-list';
export * from './text-decoration-skip-ink-all';
export * from './text-indent-keywords';
export * from './toggleevent-source';
export * from './view-transitions';

import { absSignSection } from './abs-sign';
import { activeViewTransitionSection } from './active-view-transition';
import { asyncClipboardSection } from './async-clipboard';
import { baselineShiftSection } from './baseline-shift';
import { caretPositionFromPointSection } from './caret-position-from-point';
import { composedRangesSection } from './composed-ranges';
import { containerStyleQueriesSection } from './container-style-queries';
import { contentVisibilitySection } from './content-visibility';
import { contrastColorSection } from './contrast-color';
import { crispEdgesSection } from './crisp-edges';
import { detailsContentSection } from './details-content';
import { eventTimingSection } from './event-timing';
import { fieldSizingSection } from './field-sizing';
import { fontFamilyMathSection } from './font-family-math';
import { highlightSection } from './highlight';
import { inputFileWebkitdirectorySection } from './input-file-webkitdirectory';
import { invokerCommandsSection } from './invoker-commands';
import { lcpSection } from './largest-contentful-paint';
import { openPseudoSection } from './open-pseudo';
import { popoverSection } from './popover';
import { printColorAdjustSection } from './print-color-adjust';
import { requestCloseSection } from './requestclose';
import { rootFontUnitsSection } from './root-font-units';
import { scopeSection } from './scope';
import { screenWakeLockSection } from './screen-wake-lock';
import { scrollbarColorSection } from './scrollbar-color';
import { scrollendSection } from './scrollend';
import { shapeFunctionSection } from './shape-function';
import { sharedWorkerSection } from './shared-worker';
import { spellingGrammarErrorSection } from './spelling-grammar-error';
import { suspenseListSection } from './suspense-list';
import { textDecorationSkipInkAllSection } from './text-decoration-skip-ink-all';
import { textIndentKeywordsSection } from './text-indent-keywords';
import { toggleEventSourceSection } from './toggleevent-source';
import type { PlaygroundSection } from './types';
import { viewTransitionsSection } from './view-transitions';

export const playgroundSections: PlaygroundSection[] = [
  activeViewTransitionSection,
  asyncClipboardSection,
  baselineShiftSection,
  caretPositionFromPointSection,
  composedRangesSection,
  containerStyleQueriesSection,
  contentVisibilitySection,
  contrastColorSection,
  crispEdgesSection,
  detailsContentSection,
  eventTimingSection,
  fieldSizingSection,
  fontFamilyMathSection,
  inputFileWebkitdirectorySection,
  invokerCommandsSection,
  lcpSection,
  openPseudoSection,
  popoverSection,
  requestCloseSection,
  printColorAdjustSection,
  rootFontUnitsSection,
  scopeSection,
  screenWakeLockSection,
  scrollbarColorSection,
  scrollendSection,
  sharedWorkerSection,
  suspenseListSection,
  absSignSection,
  highlightSection,
  shapeFunctionSection,
  spellingGrammarErrorSection,
  textDecorationSkipInkAllSection,
  textIndentKeywordsSection,
  toggleEventSourceSection,
  viewTransitionsSection,
];
