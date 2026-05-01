import { AIIcon, IconLink } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const LlmLink: FC = () => (
  <IconLink href="/llms.txt" label="LLMS" openInNewTab>
    <AIIcon size="lg" />
  </IconLink>
);
