'use client';

import { Heading } from '../heading';
import { IconButton } from '../icon-button';
import { CloseIcon } from '../icons';
import { Modal } from '../modal';
import { FC, PropsWithChildren, useId } from 'react';

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
        id={rootId}
        aria-labelledby={`${rootId}-header`}
        aria-describedby={`${rootId}-content`}
        className="min-h-svh"
      >
        <div
          id={`${rootId}-header`}
          className="flex items-center justify-center p-4 pb-2"
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
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- 参考:https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/no-static-element-interactions.md#case-the-event-handler-is-only-being-used-to-capture-bubbled-events */}
        <div
          id={`${rootId}-content`}
          className="p-4"
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
