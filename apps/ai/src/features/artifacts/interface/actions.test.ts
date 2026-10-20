import { refresh, revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requireAllowedSession } from '@/shared/auth/require-allowed-session';

import {
  changeSharedVersion,
  publishVersion,
  unpublish,
} from '../application/artifact-shares';
import { forkVersion } from '../application/artifacts';
import {
  changeSharedVersionAction,
  forkArtifactVersionAction,
  publishArtifactVersionAction,
  unpublishArtifactAction,
} from './actions';

vi.mock('next/cache', () => ({
  refresh: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));
vi.mock('@/shared/auth/require-allowed-session', () => ({
  requireAllowedSession: vi.fn(),
}));
vi.mock('../application/artifact-shares', () => ({
  changeSharedVersion: vi.fn(),
  publishVersion: vi.fn(),
  unpublish: vi.fn(),
}));
vi.mock('../application/artifacts', () => ({
  forkVersion: vi.fn(),
}));

const ARTIFACT_ID = 'a1b2c3d4e5f6';

beforeEach(() => {
  vi.mocked(requireAllowedSession).mockResolvedValue({ userId: 'u1' });
});

describe('publishArtifactVersionAction', () => {
  describe('正常系', () => {
    it('持ち主として版を公開し、画面を描き直して slug を返す', async () => {
      vi.mocked(publishVersion).mockResolvedValue({ slug: 'AAAAAAAAAAAAAAAA' });

      await expect(
        publishArtifactVersionAction(ARTIFACT_ID, 2),
      ).resolves.toStrictEqual({ slug: 'AAAAAAAAAAAAAAAA' });
      expect(publishVersion).toHaveBeenCalledExactlyOnceWith({
        userId: 'u1',
        artifactId: ARTIFACT_ID,
        version: 2,
      });
      expect(refresh).toHaveBeenCalledOnce();
    });
  });

  describe('異常系', () => {
    it('未許可の利用者なら、公開せず描き直さずに null を返す', async () => {
      vi.mocked(requireAllowedSession).mockResolvedValue(null);

      await expect(publishArtifactVersionAction(ARTIFACT_ID, 2)).resolves.toBe(
        null,
      );
      expect(publishVersion).not.toHaveBeenCalled();
      expect(refresh).not.toHaveBeenCalled();
    });
  });
});

describe('changeSharedVersionAction', () => {
  describe('正常系', () => {
    it('持ち主として公開する版を変え、画面を描き直して changed を返す', async () => {
      vi.mocked(changeSharedVersion).mockResolvedValue('changed');

      await expect(changeSharedVersionAction(ARTIFACT_ID, 2)).resolves.toBe(
        'changed',
      );
      expect(changeSharedVersion).toHaveBeenCalledExactlyOnceWith({
        userId: 'u1',
        artifactId: ARTIFACT_ID,
        version: 2,
      });
      expect(refresh).toHaveBeenCalledOnce();
    });
  });

  describe('異常系', () => {
    it('別のタブで取り消されていても、古い画面を描き直して unshared を返す', async () => {
      vi.mocked(changeSharedVersion).mockResolvedValue('unshared');

      await expect(changeSharedVersionAction(ARTIFACT_ID, 2)).resolves.toBe(
        'unshared',
      );
      expect(refresh).toHaveBeenCalledOnce();
    });

    it('未許可の利用者なら、変えず描き直さずに failed を返す', async () => {
      vi.mocked(requireAllowedSession).mockResolvedValue(null);

      await expect(changeSharedVersionAction(ARTIFACT_ID, 2)).resolves.toBe(
        'failed',
      );
      expect(changeSharedVersion).not.toHaveBeenCalled();
      expect(refresh).not.toHaveBeenCalled();
    });
  });
});

describe('unpublishArtifactAction', () => {
  describe('正常系', () => {
    it('持ち主として取り消し、画面を描き直して true を返す', async () => {
      vi.mocked(unpublish).mockResolvedValue(true);

      await expect(unpublishArtifactAction(ARTIFACT_ID)).resolves.toBe(true);
      expect(unpublish).toHaveBeenCalledExactlyOnceWith({
        userId: 'u1',
        artifactId: ARTIFACT_ID,
      });
      expect(refresh).toHaveBeenCalledOnce();
    });
  });

  describe('異常系', () => {
    it('別のタブで先に取り消されていて消す行が無くても、古い画面を描き直して false を返す', async () => {
      vi.mocked(unpublish).mockResolvedValue(false);

      await expect(unpublishArtifactAction(ARTIFACT_ID)).resolves.toBe(false);
      expect(refresh).toHaveBeenCalledOnce();
    });

    it('未許可の利用者なら、取り消さず描き直さずに false を返す', async () => {
      vi.mocked(requireAllowedSession).mockResolvedValue(null);

      await expect(unpublishArtifactAction(ARTIFACT_ID)).resolves.toBe(false);
      expect(unpublish).not.toHaveBeenCalled();
      expect(refresh).not.toHaveBeenCalled();
    });
  });
});

describe('forkArtifactVersionAction', () => {
  describe('正常系', () => {
    it('持ち主として版をフォークし、一覧を取り直させてから、新しい生成物のページへ移す', async () => {
      vi.mocked(forkVersion).mockResolvedValue({
        artifactId: 'f6e5d4c3b2a1',
        version: 1,
      });

      await forkArtifactVersionAction(ARTIFACT_ID, 2);

      expect(forkVersion).toHaveBeenCalledExactlyOnceWith({
        userId: 'u1',
        artifactId: ARTIFACT_ID,
        version: 2,
      });
      expect(revalidatePath).toHaveBeenCalledExactlyOnceWith(
        '/artifacts',
        'layout',
      );
      expect(redirect).toHaveBeenCalledExactlyOnceWith(
        '/artifacts/f6e5d4c3b2a1',
      );
      // redirect は投げて終わるので、取り直させるのはその前
      expect(revalidatePath).toHaveBeenCalledBefore(vi.mocked(redirect));
    });
  });

  describe('異常系', () => {
    it('持ち主の版が無ければ、取り直させず移らずに戻る', async () => {
      vi.mocked(forkVersion).mockResolvedValue(null);

      await expect(
        forkArtifactVersionAction(ARTIFACT_ID, 2),
      ).resolves.toBeUndefined();
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('未許可の利用者なら、フォークせず移らずに戻る', async () => {
      vi.mocked(requireAllowedSession).mockResolvedValue(null);

      await expect(
        forkArtifactVersionAction(ARTIFACT_ID, 2),
      ).resolves.toBeUndefined();
      expect(forkVersion).not.toHaveBeenCalled();
      expect(revalidatePath).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalled();
    });
  });
});
