'use client';

import { FC, PropsWithChildren, useId } from 'react';
import { AccordionItemProvider } from './context';

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
