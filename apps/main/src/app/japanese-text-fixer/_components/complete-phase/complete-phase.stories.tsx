import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { withProofreadState } from '../../_state/story-decorator';
import { CompletePhase } from './complete-phase';

const meta: Meta<typeof CompletePhase> = {
  title: 'app/japanese-text-fixer/complete-phase',
  component: CompletePhase,
};

export default meta;
type Story = StoryObj<typeof CompletePhase>;

export const WithErrors: Story = {
  decorators: [
    withProofreadState({
      phase: 'complete',
      inputText: '満点の星空が見れる。',
      apiResponseText: '満点の星空が見れる。',
      reviewText: '満点の星空が見られる。',
      annotations: [
        {
          id: 'annotation-0',
          original: {
            type: 'lint',
            ruleId: 'ra-nuki',
            message: 'ら抜き言葉を使用しています。',
            index: 6,
            line: 1,
            column: 6,
            range: [6, 8],
            loc: {
              start: { line: 1, column: 6 },
              end: { line: 1, column: 8 },
            },
            severity: 1,
          },
        },
      ],
    }),
  ],
};

export const NoErrors: Story = {
  decorators: [
    withProofreadState({
      phase: 'complete',
      inputText: '満点の星空が見られる。',
      apiResponseText: '満点の星空が見られる。',
      reviewText: '満点の星空が見られる。',
      annotations: [],
    }),
  ],
};
