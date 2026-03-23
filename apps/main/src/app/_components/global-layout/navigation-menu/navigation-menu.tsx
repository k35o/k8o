'use client';

import {
  CloseIcon,
  IconButton,
  Modal,
  NavigationMenuIcon,
  PortalRootProvider,
  useWindowResize,
} from '@k8o/arte-odyssey';
import { type FC, Suspense, useCallback, useRef, useState } from 'react';
import { ContactToMe } from '../../contact-to-me';
import { ToggleTheme } from '../../toggle-theme';
import { LlmLink } from '../llm-link';
import { TagsLink } from '../tags-link';

export const NavigationMenu: FC = () => {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  useWindowResize(onClose, { debounceMs: 300 });

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
                <li>
                  <TagsLink onNavigate={onClose} />
                </li>
                <li>
                  <Suspense fallback={null}>
                    <ContactToMe fullWidth />
                  </Suspense>
                </li>
              </ul>
            </nav>
            <div className="flex items-center justify-center">
              <div className="flex justify-center gap-4">
                <LlmLink />
                <ToggleTheme />
              </div>
            </div>
          </div>
        </PortalRootProvider>
      </Modal>
    </>
  );
};
