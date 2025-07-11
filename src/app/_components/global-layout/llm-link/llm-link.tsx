import { IconLink } from '@/components/icon-link';
import { AIIcon } from '@/components/icons';
import { FC } from 'react';

export const LlmLink: FC = () => {
  return (
    <IconLink href="/llms.txt" label="LLMS">
      <AIIcon size="lg" />
    </IconLink>
  );
};
