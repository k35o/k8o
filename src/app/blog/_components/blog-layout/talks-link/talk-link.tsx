import { getBlog } from '#services/blog';
import { SlideIcon } from '@/components/icons';
import { LinkButton } from '@/components/link-button';
import { FC } from 'react';

export const TalkLink: FC<{ slug: string }> = async ({ slug }) => {
  const { slideUrl } = await getBlog(slug);
  if (!slideUrl) {
    return null;
  }

  return (
    <div className="flex self-end">
      <LinkButton
        href={slideUrl}
        variant="outlined"
        size="sm"
        startIcon={<SlideIcon size="sm" />}
      >
        スライドを見る
      </LinkButton>
    </div>
  );
};
