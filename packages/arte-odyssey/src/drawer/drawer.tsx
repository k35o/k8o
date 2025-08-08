'use client';

import { type FC, type PropsWithChildren, useId } from 'react';
import { Heading } from '../heading';
import { IconButton } from '../icon-button';
import { CloseIcon } from '../icons';
import { Modal } from '../modal';

export const Drawer: FC<
  PropsWithChildren<{
    title: string;
    isOpen: boolean;
    onClose: () => void;
  }>
> = ({ title, isOpen, onClose, children }) => {
  const rootId = useId();

  return (
    <Modal isOpen={isOpen} onClose={onClose} type="right">
      <section
        aria-describedby={`${rootId}-content`}
        aria-labelledby={`${rootId}-header`}
        className="min-h-svh"
        id={rootId}
      >
        <div
          className="flex items-center justify-center p-4 pb-2"
          id={`${rootId}-header`}
        >
          <Heading type="h3">{title}</Heading>
          <div className="absolute top-2 right-2">
            <IconButton
              label="閉じる"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <CloseIcon size="sm" />
            </IconButton>
          </div>
        </div>
        {/** biome-ignore lint/a11y/noStaticElementInteractions:　propagationなので */}
        {/** biome-ignore lint/a11y/useKeyWithClickEvents: propagationなので */}
        <div
          className="p-4"
          id={`${rootId}-content`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {children}
        </div>
      </section>
    </Modal>
  );
};
