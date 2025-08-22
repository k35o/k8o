import { IconLink } from '@k8o/arte-odyssey/icon-link';
import { AIIcon } from '@k8o/arte-odyssey/icons';
import type { FC } from 'react';

export const LlmLink: FC = () => {
  return (
    <IconLink href="/llms.txt" label="LLMS" openInNewTab>
      <AIIcon size="lg" />
    </IconLink>
  );
};
