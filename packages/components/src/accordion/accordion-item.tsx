'use client';

import { AccordionItemProvider } from './context';
import { FC, PropsWithChildren, useId } from 'react';

export const AccordionItem: FC<
  PropsWithChildren<{ defaultOpen?: boolean }>
> = ({ children, defaultOpen = false }) => {
  const id = useId();
  return (
    <AccordionItemProvider defaultOpen={defaultOpen} id={id}>
      <div className="border-border-mute border-t last:border-b">
        {children}
      </div>
    </AccordionItemProvider>
  );
};
