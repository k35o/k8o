'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, FC } from 'react';

import { Playground } from '@/playgrounds/playground';
import type { PlaygroundSection } from '@/playgrounds/types';

type EmbedProps = {
  demo?: string | undefined;
};

type Props = EmbedProps & {
  sectionId: string;
};

const toEmbed = (section: PlaygroundSection): FC<EmbedProps> =>
  function SectionEmbed({ demo }) {
    const demos =
      demo === undefined
        ? section.demos
        : section.demos.filter((d) => d.title === demo);
    if (demos.length === 0) {
      throw new Error(
        `Playgroundデモが見つかりません: ${section.id} / ${demo ?? ''}`,
      );
    }

    return (
      <>
        {demos.map((sectionDemo) => {
          const DemoComponent = sectionDemo.component;
          return (
            <Playground
              description={sectionDemo.description}
              href={`/playgrounds/${section.id}`}
              key={sectionDemo.title}
              title={sectionDemo.title}
            >
              <DemoComponent />
            </Playground>
          );
        })}
      </>
    );
  };

// 記事のページは /blog/[slug] の1つのルートなので、sections.ts を読むとすべてのデモが全記事に載る。
// セクションごとに next/dynamic で読み、そのデモを描く記事でだけチャンクと CSS を読む。
// next/dynamic は書き下した import() から SSR の HTML に CSS を載せるので、id から組み立てない
const embeds: Record<string, ComponentType<EmbedProps>> = {
  'abs-sign': dynamic(() =>
    import('@/playgrounds/abs-sign').then(({ absSignSection }) =>
      toEmbed(absSignSection),
    ),
  ),
  'active-view-transition': dynamic(() =>
    import('@/playgrounds/active-view-transition').then(
      ({ activeViewTransitionSection }) => toEmbed(activeViewTransitionSection),
    ),
  ),
  'alpha-function': dynamic(() =>
    import('@/playgrounds/alpha-function').then(({ alphaFunctionSection }) =>
      toEmbed(alphaFunctionSection),
    ),
  ),
  'animation-accessors': dynamic(() =>
    import('@/playgrounds/animation-accessors').then(
      ({ animationAccessorsSection }) => toEmbed(animationAccessorsSection),
    ),
  ),
  arianotify: dynamic(() =>
    import('@/playgrounds/arianotify').then(({ ariaNotifySection }) =>
      toEmbed(ariaNotifySection),
    ),
  ),
  'async-clipboard': dynamic(() =>
    import('@/playgrounds/async-clipboard').then(({ asyncClipboardSection }) =>
      toEmbed(asyncClipboardSection),
    ),
  ),
  autocorrect: dynamic(() =>
    import('@/playgrounds/autocorrect').then(({ autocorrectSection }) =>
      toEmbed(autocorrectSection),
    ),
  ),
  'baseline-shift': dynamic(() =>
    import('@/playgrounds/baseline-shift').then(({ baselineShiftSection }) =>
      toEmbed(baselineShiftSection),
    ),
  ),
  'caret-position-from-point': dynamic(() =>
    import('@/playgrounds/caret-position-from-point').then(
      ({ caretPositionFromPointSection }) =>
        toEmbed(caretPositionFromPointSection),
    ),
  ),
  'composed-ranges': dynamic(() =>
    import('@/playgrounds/composed-ranges').then(({ composedRangesSection }) =>
      toEmbed(composedRangesSection),
    ),
  ),
  'container-name-queries': dynamic(() =>
    import('@/playgrounds/container-name-queries').then(
      ({ containerNameQueriesSection }) => toEmbed(containerNameQueriesSection),
    ),
  ),
  'container-style-queries': dynamic(() =>
    import('@/playgrounds/container-style-queries').then(
      ({ containerStyleQueriesSection }) =>
        toEmbed(containerStyleQueriesSection),
    ),
  ),
  'content-visibility': dynamic(() =>
    import('@/playgrounds/content-visibility').then(
      ({ contentVisibilitySection }) => toEmbed(contentVisibilitySection),
    ),
  ),
  'contrast-color': dynamic(() =>
    import('@/playgrounds/contrast-color').then(({ contrastColorSection }) =>
      toEmbed(contrastColorSection),
    ),
  ),
  'crisp-edges': dynamic(() =>
    import('@/playgrounds/crisp-edges').then(({ crispEdgesSection }) =>
      toEmbed(crispEdgesSection),
    ),
  ),
  'details-content': dynamic(() =>
    import('@/playgrounds/details-content').then(({ detailsContentSection }) =>
      toEmbed(detailsContentSection),
    ),
  ),
  'event-timing': dynamic(() =>
    import('@/playgrounds/event-timing').then(({ eventTimingSection }) =>
      toEmbed(eventTimingSection),
    ),
  ),
  'field-sizing': dynamic(() =>
    import('@/playgrounds/field-sizing').then(({ fieldSizingSection }) =>
      toEmbed(fieldSizingSection),
    ),
  ),
  'font-family-math': dynamic(() =>
    import('@/playgrounds/font-family-math').then(({ fontFamilyMathSection }) =>
      toEmbed(fontFamilyMathSection),
    ),
  ),
  highlight: dynamic(() =>
    import('@/playgrounds/highlight').then(({ highlightSection }) =>
      toEmbed(highlightSection),
    ),
  ),
  'input-file-webkitdirectory': dynamic(() =>
    import('@/playgrounds/input-file-webkitdirectory').then(
      ({ inputFileWebkitdirectorySection }) =>
        toEmbed(inputFileWebkitdirectorySection),
    ),
  ),
  'intl-locale-info': dynamic(() =>
    import('@/playgrounds/intl-locale-info').then(({ intlLocaleInfoSection }) =>
      toEmbed(intlLocaleInfoSection),
    ),
  ),
  'invoker-commands': dynamic(() =>
    import('@/playgrounds/invoker-commands').then(
      ({ invokerCommandsSection }) => toEmbed(invokerCommandsSection),
    ),
  ),
  'largest-contentful-paint': dynamic(() =>
    import('@/playgrounds/largest-contentful-paint').then(({ lcpSection }) =>
      toEmbed(lcpSection),
    ),
  ),
  'light-dark-image': dynamic(() =>
    import('@/playgrounds/light-dark-image').then(({ lightDarkImageSection }) =>
      toEmbed(lightDarkImageSection),
    ),
  ),
  'media-pseudos': dynamic(() =>
    import('@/playgrounds/media-pseudos').then(({ mediaPseudosSection }) =>
      toEmbed(mediaPseudosSection),
    ),
  ),
  'open-pseudo': dynamic(() =>
    import('@/playgrounds/open-pseudo').then(({ openPseudoSection }) =>
      toEmbed(openPseudoSection),
    ),
  ),
  'overflow-anchor': dynamic(() =>
    import('@/playgrounds/overflow-anchor').then(({ overflowAnchorSection }) =>
      toEmbed(overflowAnchorSection),
    ),
  ),
  popover: dynamic(() =>
    import('@/playgrounds/popover').then(({ popoverSection }) =>
      toEmbed(popoverSection),
    ),
  ),
  'print-color-adjust': dynamic(() =>
    import('@/playgrounds/print-color-adjust').then(
      ({ printColorAdjustSection }) => toEmbed(printColorAdjustSection),
    ),
  ),
  'progress-function': dynamic(() =>
    import('@/playgrounds/progress-function').then(
      ({ progressFunctionSection }) => toEmbed(progressFunctionSection),
    ),
  ),
  requestclose: dynamic(() =>
    import('@/playgrounds/requestclose').then(({ requestCloseSection }) =>
      toEmbed(requestCloseSection),
    ),
  ),
  'revert-rule': dynamic(() =>
    import('@/playgrounds/revert-rule').then(({ revertRuleSection }) =>
      toEmbed(revertRuleSection),
    ),
  ),
  'root-font-units': dynamic(() =>
    import('@/playgrounds/root-font-units').then(({ rootFontUnitsSection }) =>
      toEmbed(rootFontUnitsSection),
    ),
  ),
  scope: dynamic(() =>
    import('@/playgrounds/scope').then(({ scopeSection }) =>
      toEmbed(scopeSection),
    ),
  ),
  'screen-wake-lock': dynamic(() =>
    import('@/playgrounds/screen-wake-lock').then(({ screenWakeLockSection }) =>
      toEmbed(screenWakeLockSection),
    ),
  ),
  'scrollbar-color': dynamic(() =>
    import('@/playgrounds/scrollbar-color').then(({ scrollbarColorSection }) =>
      toEmbed(scrollbarColorSection),
    ),
  ),
  scrollend: dynamic(() =>
    import('@/playgrounds/scrollend').then(({ scrollendSection }) =>
      toEmbed(scrollendSection),
    ),
  ),
  'shape-function': dynamic(() =>
    import('@/playgrounds/shape-function').then(({ shapeFunctionSection }) =>
      toEmbed(shapeFunctionSection),
    ),
  ),
  'shared-worker': dynamic(() =>
    import('@/playgrounds/shared-worker').then(({ sharedWorkerSection }) =>
      toEmbed(sharedWorkerSection),
    ),
  ),
  'sibling-count-index': dynamic(() =>
    import('@/playgrounds/sibling-count-index').then(
      ({ siblingCountIndexSection }) => toEmbed(siblingCountIndexSection),
    ),
  ),
  'spelling-grammar-error': dynamic(() =>
    import('@/playgrounds/spelling-grammar-error').then(
      ({ spellingGrammarErrorSection }) => toEmbed(spellingGrammarErrorSection),
    ),
  ),
  'suspense-list': dynamic(() =>
    import('@/playgrounds/suspense-list').then(({ suspenseListSection }) =>
      toEmbed(suspenseListSection),
    ),
  ),
  'text-decoration-skip-ink-all': dynamic(() =>
    import('@/playgrounds/text-decoration-skip-ink-all').then(
      ({ textDecorationSkipInkAllSection }) =>
        toEmbed(textDecorationSkipInkAllSection),
    ),
  ),
  'text-indent-keywords': dynamic(() =>
    import('@/playgrounds/text-indent-keywords').then(
      ({ textIndentKeywordsSection }) => toEmbed(textIndentKeywordsSection),
    ),
  ),
  'toggleevent-source': dynamic(() =>
    import('@/playgrounds/toggleevent-source').then(
      ({ toggleEventSourceSection }) => toEmbed(toggleEventSourceSection),
    ),
  ),
  'view-transitions': dynamic(() =>
    import('@/playgrounds/view-transitions').then(
      ({ viewTransitionsSection }) => toEmbed(viewTransitionsSection),
    ),
  ),
};

export const PlaygroundEmbed: FC<Props> = ({ sectionId, demo }) => {
  const Embed = embeds[sectionId];
  if (Embed === undefined) {
    throw new Error(`Playgroundセクションが見つかりません: ${sectionId}`);
  }

  return <Embed demo={demo} />;
};
