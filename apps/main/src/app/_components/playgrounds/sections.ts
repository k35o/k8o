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

export const getPlaygroundSection = (
  id: string,
): PlaygroundSection | undefined =>
  playgroundSections.find((section) => section.id === id);
