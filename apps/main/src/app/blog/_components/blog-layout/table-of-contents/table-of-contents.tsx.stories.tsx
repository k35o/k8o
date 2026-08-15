import preview from '../../../../../../.storybook/preview';
import { TableOfContents } from './table-of-contents';

const meta = preview.meta({
  title: 'app/blog/blog-layout/table-of-contents',
  component: TableOfContents,
});

export const Primary = meta.story({
  args: {
    headingTree: {
      depth: 0,
      children: [
        {
          depth: 1,
          text: 'タイトル1',
          children: [
            {
              depth: 2,
              text: 'タイトル1-1',
              children: [],
            },
            {
              depth: 2,
              text: 'タイトル1-2',
              children: [
                {
                  depth: 3,
                  text: 'タイトル1-2-1',
                },
                {
                  depth: 3,
                  text: 'タイトル1-2-2',
                },
              ],
            },
            {
              depth: 2,
              text: 'タイトル1-3',
              children: [],
            },
          ],
        },
        {
          depth: 1,
          text: 'タイトル2',
          children: [],
        },
        {
          depth: 1,
          text: 'タイトル3',
          children: [
            {
              depth: 2,
              text: 'タイトル3-1',
              children: [],
            },
          ],
        },
      ],
    },
  },
});
