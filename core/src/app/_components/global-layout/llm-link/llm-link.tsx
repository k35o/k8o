import { IconLink } from '@k8o/components/icon-link';
import { AIIcon } from '@k8o/components/icons';
import { FC } from 'react';

export const LlmLink: FC = () => {
  return (
    <IconLink href="/llms.txt" label="LLMS" prefetch={false}>
      <AIIcon size="lg" />
    </IconLink>
  );
};
