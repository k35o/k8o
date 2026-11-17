import { expect, userEvent, waitFor } from 'storybook/test';

import preview from '../../../.storybook/preview';
import { Playground } from '../playground';
import { WebkitRelativePathDemo } from './webkit-relative-path-demo';

const playgroundTitle = WebkitRelativePathDemo.name;

const meta = preview.meta({
  title: 'playgrounds/input-file-webkitdirectory/WebkitRelativePathDemo',
  component: WebkitRelativePathDemo,
  decorators: [
    (Story) => (
      <Playground title={playgroundTitle}>
        <Story />
      </Playground>
    ),
  ],
});

export const Default = meta.story();

// userEvent.upload は input の files を読むだけの値に差し替え、FileField が一覧を files に書き戻せなくなるので、フォルダを選んだときと同じく files に入れて change を送る
const pickFiles = (input: HTMLInputElement, files: File[]): void => {
  const transfer = new DataTransfer();
  for (const file of files) {
    transfer.items.add(file);
  }
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

// 正常系: 選んだファイルが一覧にあっても、すべて解除で一覧と input の両方が空になる
export const ClearsAllFiles = meta.story({
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText<HTMLInputElement>('ディレクトリ選択');
    pickFiles(input, [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')]);
    await waitFor(async () => {
      await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    });
    await expect(input.files).toHaveLength(2);

    await userEvent.click(canvas.getByRole('button', { name: 'すべて解除' }));

    await expect(canvas.queryAllByRole('listitem')).toHaveLength(0);
    await expect(input.files).toHaveLength(0);
  },
});
