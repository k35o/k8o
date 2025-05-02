'use client';

import { ColorFilters } from '../../color-filters';
import { ContactToMe } from '../../contact-to-me';
import { ToggleTheme } from '../../toggle-theme';
import { NewsLink } from '../news-link';
import { IconButton } from '@/components/icon-button';
import { CloseIcon, NavigationMenuIcon } from '@/components/icons';
import { Modal } from '@/components/modal';
import { PortalRootProvider } from '@/providers/poratl-root';
import { FC, useRef } from 'react';

export const NavigationMenu: FC = () => {
  const ref = useRef<HTMLDialogElement>(null);

  const onClose = () => {
    ref.current?.close();
  };
  return (
    <>
      <IconButton
        label="メニューを表示する"
        onClick={() => {
          ref.current?.showModal();
        }}
        size="lg"
      >
        <NavigationMenuIcon />
      </IconButton>
      <Modal type="bottom" ref={ref}>
        <PortalRootProvider value={ref}>
          <div className="flex flex-col gap-4 p-4">
            <div className="absolute top-2 right-2">
              <IconButton
                label="メニューを閉じる"
                onClick={onClose}
                size="lg"
              >
                <CloseIcon />
              </IconButton>
            </div>
            <nav className="mt-8">
              <ul className="flex w-full flex-col gap-4 p-4">
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- NewsLinkのおこぼれをもらう */}
                <li onClick={onClose}>
                  <NewsLink />
                </li>
                <li>
                  <ContactToMe fullWidth />
                </li>
              </ul>
            </nav>
            <div className="flex items-center justify-center">
              <div className="flex justify-center gap-4">
                <ColorFilters.ListBox placement="top" />
                <ToggleTheme />
              </div>
            </div>
          </div>
        </PortalRootProvider>
      </Modal>
    </>
  );
};
