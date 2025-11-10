'use client';

import { IconButton } from '@k8o/arte-odyssey/icon-button';
import { CloseIcon, NavigationMenuIcon } from '@k8o/arte-odyssey/icons';
import { Modal } from '@k8o/arte-odyssey/modal';
import { PortalRootProvider } from '@k8o/arte-odyssey/providers';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { ColorFilters } from '../../color-filters';
import { ContactToMe } from '../../contact-to-me';
import { ToggleTheme } from '../../toggle-theme';
import { LlmLink } from '../llm-link';
import { NewsLink } from '../news-link';
import { TagsLink } from '../tags-link';

export const NavigationMenu: FC = () => {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (open) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [open, onClose]);

  return (
    <>
      <IconButton
        label="メニューを表示する"
        onClick={() => {
          setOpen(true);
        }}
        size="lg"
      >
        <NavigationMenuIcon />
      </IconButton>
      <Modal isOpen={open} onClose={onClose} ref={ref} type="bottom">
        <PortalRootProvider value={ref}>
          <div className="flex flex-col gap-4 p-4">
            <div className="absolute top-2 right-2">
              <IconButton label="メニューを閉じる" onClick={onClose} size="lg">
                <CloseIcon />
              </IconButton>
            </div>
            <nav className="mt-8">
              <ul className="flex w-full flex-col gap-4 p-4">
                {/** biome-ignore lint/a11y/useKeyWithClickEvents: propagation */}
                <li onClick={onClose}>
                  <TagsLink />
                </li>
                {/** biome-ignore lint/a11y/useKeyWithClickEvents: propagation */}
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
                <LlmLink />
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
