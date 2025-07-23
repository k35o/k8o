import { IconLink } from '@k8o/arte-odyssey/icon-link';
import { AIIcon } from '@k8o/arte-odyssey/icons';
import Link from 'next/link';
import { FC } from 'react';

export const LlmLink: FC = () => {
  return (
    <IconLink
      href="/llms.txt"
      label="LLMS"
      renderAnchor={(props) => <Link {...props} prefetch={false} />}
      openInNewTab
    >
      <AIIcon size="lg" />
    </IconLink>
  );
};
