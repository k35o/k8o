import type { PlaygroundSection } from '../types';
import { WebkitRelativePathDemo } from './webkit-relative-path-demo';

export { WebkitRelativePathDemo } from './webkit-relative-path-demo';

export const inputFileWebkitdirectorySection: PlaygroundSection = {
  id: 'input-file-webkitdirectory',
  title: 'input要素のwebkitdirectory属性',
  description: 'ディレクトリ選択を可能にするwebkitdirectory属性の使用例です。',
  category: 'html',
  type: 'blog',
  slug: 'input-file-webkitdirectory',
  demos: [
    {
      component: WebkitRelativePathDemo,
      title: 'webkitRelativePathの例',
      description:
        'フォルダを選ぶと、含まれる各ファイルがwebkitRelativePathの相対パス付きで一覧表示されます。',
    },
  ],
};
