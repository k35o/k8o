'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, FC } from 'react';

import { Playground } from './playground';
import type { PlaygroundSection } from './types';

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
    import('./abs-sign').then(({ absSignSection }) => toEmbed(absSignSection)),
  ),
  'active-view-transition': dynamic(() =>
    import('./active-view-transition').then(({ activeViewTransitionSection }) =>
      toEmbed(activeViewTransitionSection),
    ),
  ),
  'alpha-function': dynamic(() =>
    import('./alpha-function').then(({ alphaFunctionSection }) =>
      toEmbed(alphaFunctionSection),
    ),
  ),
  'animation-accessors': dynamic(() =>
    import('./animation-accessors').then(({ animationAccessorsSection }) =>
      toEmbed(animationAccessorsSection),
    ),
  ),
  arianotify: dynamic(() =>
    import('./arianotify').then(({ ariaNotifySection }) =>
      toEmbed(ariaNotifySection),
    ),
  ),
  'async-clipboard': dynamic(() =>
    import('./async-clipboard').then(({ asyncClipboardSection }) =>
      toEmbed(asyncClipboardSection),
    ),
  ),
  autocorrect: dynamic(() =>
    import('./autocorrect').then(({ autocorrectSection }) =>
      toEmbed(autocorrectSection),
    ),
  ),
  'baseline-shift': dynamic(() =>
    import('./baseline-shift').then(({ baselineShiftSection }) =>
      toEmbed(baselineShiftSection),
    ),
  ),
  'caret-position-from-point': dynamic(() =>
    import('./caret-position-from-point').then(
      ({ caretPositionFromPointSection }) =>
        toEmbed(caretPositionFromPointSection),
    ),
  ),
  'composed-ranges': dynamic(() =>
    import('./composed-ranges').then(({ composedRangesSection }) =>
      toEmbed(composedRangesSection),
    ),
  ),
  'container-name-queries': dynamic(() =>
    import('./container-name-queries').then(({ containerNameQueriesSection }) =>
      toEmbed(containerNameQueriesSection),
    ),
  ),
  'container-style-queries': dynamic(() =>
    import('./container-style-queries').then(
      ({ containerStyleQueriesSection }) =>
        toEmbed(containerStyleQueriesSection),
    ),
  ),
  'content-visibility': dynamic(() =>
    import('./content-visibility').then(({ contentVisibilitySection }) =>
      toEmbed(contentVisibilitySection),
    ),
  ),
  'contrast-color': dynamic(() =>
    import('./contrast-color').then(({ contrastColorSection }) =>
      toEmbed(contrastColorSection),
    ),
  ),
  'crisp-edges': dynamic(() =>
    import('./crisp-edges').then(({ crispEdgesSection }) =>
      toEmbed(crispEdgesSection),
    ),
  ),
  'details-content': dynamic(() =>
    import('./details-content').then(({ detailsContentSection }) =>
      toEmbed(detailsContentSection),
    ),
  ),
  'event-timing': dynamic(() =>
    import('./event-timing').then(({ eventTimingSection }) =>
      toEmbed(eventTimingSection),
    ),
  ),
  'field-sizing': dynamic(() =>
    import('./field-sizing').then(({ fieldSizingSection }) =>
      toEmbed(fieldSizingSection),
    ),
  ),
  'font-family-math': dynamic(() =>
    import('./font-family-math').then(({ fontFamilyMathSection }) =>
      toEmbed(fontFamilyMathSection),
    ),
  ),
  highlight: dynamic(() =>
    import('./highlight').then(({ highlightSection }) =>
      toEmbed(highlightSection),
    ),
  ),
  'input-file-webkitdirectory': dynamic(() =>
    import('./input-file-webkitdirectory').then(
      ({ inputFileWebkitdirectorySection }) =>
        toEmbed(inputFileWebkitdirectorySection),
    ),
  ),
  'intl-locale-info': dynamic(() =>
    import('./intl-locale-info').then(({ intlLocaleInfoSection }) =>
      toEmbed(intlLocaleInfoSection),
    ),
  ),
  'invoker-commands': dynamic(() =>
    import('./invoker-commands').then(({ invokerCommandsSection }) =>
      toEmbed(invokerCommandsSection),
    ),
  ),
  'largest-contentful-paint': dynamic(() =>
    import('./largest-contentful-paint').then(({ lcpSection }) =>
      toEmbed(lcpSection),
    ),
  ),
  'light-dark-image': dynamic(() =>
    import('./light-dark-image').then(({ lightDarkImageSection }) =>
      toEmbed(lightDarkImageSection),
    ),
  ),
  'media-pseudos': dynamic(() =>
    import('./media-pseudos').then(({ mediaPseudosSection }) =>
      toEmbed(mediaPseudosSection),
    ),
  ),
  'open-pseudo': dynamic(() =>
    import('./open-pseudo').then(({ openPseudoSection }) =>
      toEmbed(openPseudoSection),
    ),
  ),
  'overflow-anchor': dynamic(() =>
    import('./overflow-anchor').then(({ overflowAnchorSection }) =>
      toEmbed(overflowAnchorSection),
    ),
  ),
  popover: dynamic(() =>
    import('./popover').then(({ popoverSection }) => toEmbed(popoverSection)),
  ),
  'print-color-adjust': dynamic(() =>
    import('./print-color-adjust').then(({ printColorAdjustSection }) =>
      toEmbed(printColorAdjustSection),
    ),
  ),
  'progress-function': dynamic(() =>
    import('./progress-function').then(({ progressFunctionSection }) =>
      toEmbed(progressFunctionSection),
    ),
  ),
  requestclose: dynamic(() =>
    import('./requestclose').then(({ requestCloseSection }) =>
      toEmbed(requestCloseSection),
    ),
  ),
  'revert-rule': dynamic(() =>
    import('./revert-rule').then(({ revertRuleSection }) =>
      toEmbed(revertRuleSection),
    ),
  ),
  'root-font-units': dynamic(() =>
    import('./root-font-units').then(({ rootFontUnitsSection }) =>
      toEmbed(rootFontUnitsSection),
    ),
  ),
  scope: dynamic(() =>
    import('./scope').then(({ scopeSection }) => toEmbed(scopeSection)),
  ),
  'screen-wake-lock': dynamic(() =>
    import('./screen-wake-lock').then(({ screenWakeLockSection }) =>
      toEmbed(screenWakeLockSection),
    ),
  ),
  'scrollbar-color': dynamic(() =>
    import('./scrollbar-color').then(({ scrollbarColorSection }) =>
      toEmbed(scrollbarColorSection),
    ),
  ),
  scrollend: dynamic(() =>
    import('./scrollend').then(({ scrollendSection }) =>
      toEmbed(scrollendSection),
    ),
  ),
  'shape-function': dynamic(() =>
    import('./shape-function').then(({ shapeFunctionSection }) =>
      toEmbed(shapeFunctionSection),
    ),
  ),
  'shared-worker': dynamic(() =>
    import('./shared-worker').then(({ sharedWorkerSection }) =>
      toEmbed(sharedWorkerSection),
    ),
  ),
  'sibling-count-index': dynamic(() =>
    import('./sibling-count-index').then(({ siblingCountIndexSection }) =>
      toEmbed(siblingCountIndexSection),
    ),
  ),
  'spelling-grammar-error': dynamic(() =>
    import('./spelling-grammar-error').then(({ spellingGrammarErrorSection }) =>
      toEmbed(spellingGrammarErrorSection),
    ),
  ),
  'suspense-list': dynamic(() =>
    import('./suspense-list').then(({ suspenseListSection }) =>
      toEmbed(suspenseListSection),
    ),
  ),
  'text-decoration-skip-ink-all': dynamic(() =>
    import('./text-decoration-skip-ink-all').then(
      ({ textDecorationSkipInkAllSection }) =>
        toEmbed(textDecorationSkipInkAllSection),
    ),
  ),
  'text-indent-keywords': dynamic(() =>
    import('./text-indent-keywords').then(({ textIndentKeywordsSection }) =>
      toEmbed(textIndentKeywordsSection),
    ),
  ),
  'toggleevent-source': dynamic(() =>
    import('./toggleevent-source').then(({ toggleEventSourceSection }) =>
      toEmbed(toggleEventSourceSection),
    ),
  ),
  'view-transitions': dynamic(() =>
    import('./view-transitions').then(({ viewTransitionsSection }) =>
      toEmbed(viewTransitionsSection),
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
