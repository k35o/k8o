import { AIIcon, IconButton } from '@k8o/arte-odyssey';
import type { FC } from 'react';

export const LlmLink: FC = () => (
  <IconButton
    label="LLMS"
    renderItem={({
      className,
      children,
      'aria-label': ariaLabel,
      triggerProps,
    }) => (
      <a
        aria-label={ariaLabel}
        className={className}
        href="/llms.txt"
        rel="noopener noreferrer"
        target="_blank"
        {...triggerProps}
      >
        {children}
      </a>
    )}
  >
    <AIIcon size="lg" />
  </IconButton>
);
