'use client';

import { ContactToMe } from '../../contact-to-me';
import { ToggleTheme } from '../../toggle-theme';
import { NewsLink } from '../news-link';
import { IconButton } from '@/components/icon-button';
import { CloseIcon, NavigationMenuIcon } from '@/components/icons';
import { FC, useRef } from 'react';

export const NavigationMenu: FC = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const onClose = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <IconButton
        aria-label="メニューを表示する"
        onClick={() => {
          dialogRef.current?.showModal();
        }}
        size="lg"
      >
        <NavigationMenuIcon />
      </IconButton>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/pull/940待ち */}
      <dialog
        ref={dialogRef}
        className="bg-bg-base mt-auto w-screen max-w-screen rounded-t-lg"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="p-4">
          <div className="absolute top-2 right-2">
            <IconButton
              aria-label="メニューを閉じる"
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
                <ContactToMe />
              </li>
            </ul>
          </nav>
          <div className="flex items-center justify-center">
            <div className="flex justify-center gap-4">
              <ToggleTheme />
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
};
