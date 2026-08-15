import preview from '../../../../../.storybook/preview';
import { Playground } from '../playground';
import { FontFamilyMathDemo } from './font-family-math-demo';

const playgroundTitle = FontFamilyMathDemo.name;

const meta = preview.meta({
  title: 'playgrounds/font-family-math/FontFamilyMathDemo',
  component: FontFamilyMathDemo,
  // font-family: math のシステム数式フォントはheadless環境で解決が
  // 非決定的（ロードの有無で字形が変わる）ため、VRTの対象外にする
  parameters: { vrt: { skip: true } },
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();
