import { expect, spyOn } from 'storybook/test';

import preview from '../../../.storybook/preview';
import { Playground } from '../playground';
import { LCPDemo } from './lcp-demo';

const playgroundTitle = LCPDemo.name;

const RELOAD_BUTTON_NAME = '読み込み直して測る';

// location は差し替えられないので、文書を読み込んだ URL のほうを差し替えて今の pathname と比べさせる
const stubDocumentUrl = (url: string): void => {
  const getEntriesByType = performance.getEntriesByType.bind(performance);
  spyOn(performance, 'getEntriesByType').mockImplementation((type) =>
    type === 'navigation'
      ? [
          {
            name: url,
            entryType: 'navigation',
            startTime: 0,
            duration: 0,
            toJSON: () => ({ name: url }),
          },
        ]
      : getEntriesByType(type),
  );
};

const meta = preview.meta({
  title: 'playgrounds/largest-contentful-paint/LCPDemo',
  component: LCPDemo,
  // PerformanceObserverの実測値（startTime/size等）を表示するデモのため、VRTの対象外にする
  parameters: { vrt: { skip: true } },
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story({
  beforeEach: () => {
    stubDocumentUrl(location.href);
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText(/ページ読み込み時のLCP/u),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: RELOAD_BUTTON_NAME }),
    ).not.toBeInTheDocument();
    await expect(
      await canvas.findByRole('heading', { name: '現在のLCP' }),
    ).toBeInTheDocument();
  },
});

export const OpenedWithoutDocumentLoad = meta.story({
  beforeEach: () => {
    stubDocumentUrl(new URL('/playgrounds', location.href).href);
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('note')).toHaveTextContent(
      'このページへは文書を読み込まずに移動したため、表示しているのは文書を読み込んだページ（/playgrounds）のLCPです。',
    );
    await expect(
      canvas.getByRole('button', { name: RELOAD_BUTTON_NAME }),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText(/ページ読み込み時のLCP/u),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByText(
        /文書を読み込まないページの移動では新しく報告されません/u,
      ),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByRole('heading', {
        name: '文書を読み込んだページのLCP',
      }),
    ).toBeInTheDocument();
  },
});
