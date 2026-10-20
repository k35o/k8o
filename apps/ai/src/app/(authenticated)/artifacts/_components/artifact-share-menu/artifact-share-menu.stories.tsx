import type { ComponentProps } from 'react';
import {
  expect,
  fn,
  mocked,
  screen,
  spyOn,
  userEvent,
  within,
} from 'storybook/test';

import preview from '../../../../../../.storybook/preview';
import { ArtifactShareMenu } from './artifact-share-menu';
import type { ArtifactShareActions } from './artifact-share-menu';

import styles from './artifact-share-menu.stories.module.css';

const ARTIFACT_ID = 'a1b2c3d4e5f6';
const SLUG = 'AAAAAAAAAAAAAAAA';

// 本物のクリップボードと同じく、write は渡された中身を読み終えてから書けたことにする。中身が reject されたら書けない
const stubClipboard = () => ({
  write: spyOn(navigator.clipboard, 'write').mockImplementation(
    async (items) => {
      for (const item of items) {
        await item.getType('text/plain');
      }
    },
  ),
  writeText: spyOn(navigator.clipboard, 'writeText').mockResolvedValue(),
});

type StubbedClipboard = ReturnType<typeof stubClipboard>;

const copiedText = async (clipboard: StubbedClipboard): Promise<string> => {
  const [items] = clipboard.write.mock.calls[0] ?? [];
  const item = items?.[0];
  if (item === undefined) {
    throw new Error('クリップボードに書いていません');
  }
  return (await item.getType('text/plain')).text();
};

const menuItemNames = (): string[] =>
  screen.getAllByRole('menuitem').map((item) => item.textContent);

const meta = preview.meta({
  component: ArtifactShareMenu,
  decorators: [
    (Story) => (
      <div className={styles.frame}>
        <Story />
      </div>
    ),
  ],
  args: {
    artifactId: ARTIFACT_ID,
    selectedVersion: 2,
    share: null,
    actions: {
      publish: fn<ArtifactShareActions['publish']>(),
      changeVersion: fn<ArtifactShareActions['changeVersion']>(),
      unpublish: fn<ArtifactShareActions['unpublish']>(),
    },
  } satisfies Partial<ComponentProps<typeof ArtifactShareMenu>>,
});

export const Private = meta.story({
  play: async ({ args, canvasElement }) => {
    const clipboard = stubClipboard();
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: '共有（非公開）' }),
    );
    await expect(menuItemNames()).toStrictEqual(['版 2 を公開する']);

    const published = Promise.withResolvers<{ slug: string } | null>();
    mocked(args.actions.publish).mockReturnValue(published.promise);
    // 押した操作が終わる前（クリックの伝わりが document に届いた時点）に、写し始めているかを見る
    let writingWhenClicked = false;
    const record = (): void => {
      writingWhenClicked = clipboard.write.mock.calls.length === 1;
    };
    canvasElement.ownerDocument.addEventListener('click', record);
    try {
      await userEvent.click(
        screen.getByRole('menuitem', { name: '版 2 を公開する' }),
      );
    } finally {
      canvasElement.ownerDocument.removeEventListener('click', record);
    }
    // 公開を待ってから写すと、押した操作の外になって写せないことがある
    await expect(writingWhenClicked).toBe(true);
    await expect(args.actions.publish).toHaveBeenCalledOnce();
    await expect(args.actions.publish).toHaveBeenCalledWith(ARTIFACT_ID, 2);

    published.resolve({ slug: SLUG });
    await expect(
      await screen.findByText('版 2 を公開しました。リンクをコピーしました'),
    ).toBeInTheDocument();
    const link = new URL(await copiedText(clipboard));
    await expect(link.origin).toBe(canvasElement.ownerDocument.location.origin);
    await expect(link.pathname).toBe(`/s/${SLUG}`);
  },
});

export const PublishedWithoutCopy = meta.story({
  play: async ({ args, canvasElement }) => {
    mocked(args.actions.publish).mockResolvedValue({ slug: SLUG });
    stubClipboard().write.mockRejectedValue(
      new DOMException('Document is not focused.', 'NotAllowedError'),
    );
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: '共有（非公開）' }),
    );
    await userEvent.click(
      screen.getByRole('menuitem', { name: '版 2 を公開する' }),
    );
    // 写せなかったときに、写せたと言わない
    await expect(
      await screen.findByText('版 2 を公開しました'),
    ).toBeInTheDocument();
    await expect(
      screen.queryByText(/リンクをコピーしました/u),
    ).not.toBeInTheDocument();
  },
});

export const PublishFailed = meta.story({
  play: async ({ args, canvasElement }) => {
    mocked(args.actions.publish).mockResolvedValue(null);
    const clipboard = stubClipboard();
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: '共有（非公開）' }),
    );
    await userEvent.click(
      screen.getByRole('menuitem', { name: '版 2 を公開する' }),
    );
    await expect(
      await screen.findByText('公開に失敗しました'),
    ).toBeInTheDocument();
    // 公開できなければ、写すリンクも無い
    await expect(copiedText(clipboard)).rejects.toThrow();
  },
});

export const PublicSameVersion = meta.story({
  args: { share: { slug: SLUG, version: 2 } },
  play: async ({ args, canvasElement }) => {
    const clipboard = stubClipboard();
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: '共有（版 2 を公開中）',
      }),
    );
    // 選んでいる版を公開しているので、公開する版を変える項目は出さない
    await expect(menuItemNames()).toStrictEqual([
      '版 2 のリンクをコピー',
      '非公開にする',
    ]);

    await userEvent.click(
      screen.getByRole('menuitem', { name: '版 2 のリンクをコピー' }),
    );
    await expect(
      await screen.findByText('リンクをコピーしました'),
    ).toBeInTheDocument();
    const [copied] = clipboard.writeText.mock.calls[0] ?? [];
    await expect(new URL(copied ?? '').pathname).toBe(`/s/${SLUG}`);
    await expect(args.actions.publish).not.toHaveBeenCalled();
  },
});

export const PublicOtherVersion = meta.story({
  args: { share: { slug: SLUG, version: 1 } },
  play: async ({ args, canvasElement }) => {
    mocked(args.actions.changeVersion).mockResolvedValue('changed');
    const clipboard = stubClipboard();
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: '共有（版 1 を公開中）',
      }),
    );
    // 見ている版と違う版のリンクを写すことが、項目の名前で分かる
    await expect(menuItemNames()).toStrictEqual([
      '公開する版を版 2 にする',
      '版 1 のリンクをコピー',
      '非公開にする',
    ]);

    await userEvent.click(
      screen.getByRole('menuitem', { name: '公開する版を版 2 にする' }),
    );
    await expect(
      await screen.findByText('公開する版を版 2 にしました'),
    ).toBeInTheDocument();
    await expect(args.actions.changeVersion).toHaveBeenCalledOnce();
    await expect(args.actions.changeVersion).toHaveBeenCalledWith(
      ARTIFACT_ID,
      2,
    );
    // 公開し直す action は呼ばない。取り消されていたときに、別のリンクで公開し直してしまうため
    await expect(args.actions.publish).not.toHaveBeenCalled();
    // リンクは変わらないので、写し直さない
    await expect(clipboard.write).not.toHaveBeenCalled();
  },
});

const pressChangeVersion = async (
  canvasElement: HTMLElement,
): Promise<void> => {
  await userEvent.click(
    within(canvasElement).getByRole('button', {
      name: '共有（版 1 を公開中）',
    }),
  );
  await userEvent.click(
    screen.getByRole('menuitem', { name: '公開する版を版 2 にする' }),
  );
};

export const ChangeVersionUnshared = meta.story({
  args: { share: { slug: SLUG, version: 1 } },
  play: async ({ args, canvasElement }) => {
    // 別のタブで取り消したあとの、公開中のままの古い画面から押す
    mocked(args.actions.changeVersion).mockResolvedValue('unshared');
    await pressChangeVersion(canvasElement);

    await expect(
      await screen.findByText('公開は取り消されています'),
    ).toBeInTheDocument();
    await expect(
      screen.queryByText('公開する版を版 2 にしました'),
    ).not.toBeInTheDocument();
    await expect(args.actions.publish).not.toHaveBeenCalled();
  },
});

export const ChangeVersionFailed = meta.story({
  args: { share: { slug: SLUG, version: 1 } },
  play: async ({ args, canvasElement }) => {
    mocked(args.actions.changeVersion).mockResolvedValue('failed');
    await pressChangeVersion(canvasElement);

    await expect(
      await screen.findByText('公開する版を変えられませんでした'),
    ).toBeInTheDocument();
    await expect(
      screen.queryByText('公開する版を版 2 にしました'),
    ).not.toBeInTheDocument();
  },
});

export const CopyLinkFailed = meta.story({
  args: { share: { slug: SLUG, version: 2 } },
  play: async ({ canvasElement }) => {
    stubClipboard().writeText.mockRejectedValue(
      new DOMException('Document is not focused.', 'NotAllowedError'),
    );
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: '共有（版 2 を公開中）',
      }),
    );
    await userEvent.click(
      screen.getByRole('menuitem', { name: '版 2 のリンクをコピー' }),
    );

    await expect(
      await screen.findByText('リンクをコピーできませんでした'),
    ).toBeInTheDocument();
    await expect(
      screen.queryByText('リンクをコピーしました'),
    ).not.toBeInTheDocument();
  },
});

const openUnpublishConfirm = async (
  canvasElement: HTMLElement,
): Promise<HTMLElement> => {
  await userEvent.click(
    within(canvasElement).getByRole('button', {
      name: '共有（版 2 を公開中）',
    }),
  );
  await userEvent.click(screen.getByRole('menuitem', { name: '非公開にする' }));
  return screen.findByRole('dialog', { name: '非公開にしますか' });
};

export const ConfirmUnpublish = meta.story({
  args: { share: { slug: SLUG, version: 2 } },
  play: async ({ args, canvasElement }) => {
    mocked(args.actions.unpublish).mockResolvedValue(true);
    const openConfirm = (): Promise<HTMLElement> =>
      openUnpublishConfirm(canvasElement);

    // 戻せない操作なので、確かめてから取り消す
    const dialog = await openConfirm();
    await expect(dialog).toHaveAccessibleDescription(
      '今のリンクは使えなくなります。公開し直すと別のリンクになります。',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'キャンセル' }),
    );
    await expect(dialog).not.toBeVisible();
    await expect(args.actions.unpublish).not.toHaveBeenCalled();

    await userEvent.click(
      within(await openConfirm()).getByRole('button', { name: '非公開にする' }),
    );
    await expect(
      await screen.findByText('非公開にしました'),
    ).toBeInTheDocument();
    await expect(args.actions.unpublish).toHaveBeenCalledOnce();
    await expect(args.actions.unpublish).toHaveBeenCalledWith(ARTIFACT_ID);
    await expect(dialog).not.toBeVisible();
  },
});

export const UnpublishFailed = meta.story({
  args: { share: { slug: SLUG, version: 2 } },
  play: async ({ args, canvasElement }) => {
    mocked(args.actions.unpublish).mockResolvedValue(false);
    const dialog = await openUnpublishConfirm(canvasElement);
    await userEvent.click(
      within(dialog).getByRole('button', { name: '非公開にする' }),
    );

    // 取り消せなかったときに、取り消したと言わない
    await expect(
      await screen.findByText('非公開にできませんでした'),
    ).toBeInTheDocument();
    await expect(
      screen.queryByText('非公開にしました'),
    ).not.toBeInTheDocument();
  },
});

export const UnpublishThrew = meta.story({
  args: { share: { slug: SLUG, version: 2 } },
  play: async ({ args, canvasElement }) => {
    mocked(args.actions.unpublish).mockRejectedValue(new Error('network'));
    const dialog = await openUnpublishConfirm(canvasElement);
    await userEvent.click(
      within(dialog).getByRole('button', { name: '非公開にする' }),
    );

    await expect(
      await screen.findByText('非公開にできませんでした'),
    ).toBeInTheDocument();
    await expect(
      screen.queryByText('非公開にしました'),
    ).not.toBeInTheDocument();
  },
});
