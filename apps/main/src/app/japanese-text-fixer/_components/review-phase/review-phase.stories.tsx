import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { withProofreadState } from '../../_state/story-decorator';
import { ReviewPhase } from './review-phase';

const meta: Meta<typeof ReviewPhase> = {
  title: 'app/japanese-text-fixer/review-phase',
  component: ReviewPhase,
  decorators: [
    withProofreadState({
      phase: 'review',
      apiResponseText: '満点の星空が見れる。',
      reviewText: '満点の星空が見れる。',
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

export default meta;
type Story = StoryObj<typeof ReviewPhase>;

export const Primary: Story = {};
