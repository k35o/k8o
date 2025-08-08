import {
  createContext,
  type FC,
  type PropsWithChildren,
  type Ref,
  use,
  useId,
} from 'react';
import { Heading } from '../heading';
import { IconButton } from '../icon-button';
import { CloseIcon } from '../icons';

const DialogContext = createContext<{
  rootId: string;
} | null>(null);

const useDialogContext = () => {
  const context = use(DialogContext);
  if (context === null) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }
  return context;
};

const Root: FC<
  PropsWithChildren<{
    ref?: Ref<HTMLElement> | undefined;
    id?: string | undefined;
    tabIndex?: number | undefined;
    role?: string | undefined;
  }>
> = ({ ref, id, children, tabIndex, role = 'dialog' }) => {
  const fallbackId = useId();
  const rootId = id ?? fallbackId;

  return (
    <section
      aria-describedby={`${rootId}-content`}
      aria-labelledby={`${rootId}-header`}
      className="relative w-full rounded-lg border border-border-subtle bg-bg-base shadow-xl"
      id={id}
      ref={ref}
      role={role}
      tabIndex={tabIndex}
    >
      <DialogContext value={{ rootId }}>{children}</DialogContext>
    </section>
  );
};

const Header: FC<{
  title: string;
  onClose: () => void;
}> = ({ title, onClose }) => {
  const { rootId } = useDialogContext();
  return (
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
  );
};

export const Content: FC<PropsWithChildren> = ({ children }) => {
  const { rootId } = useDialogContext();
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: propagationなので
    // biome-ignore lint/a11y/useKeyWithClickEvents: propagationなので
    <div
      className="p-4"
      id={`${rootId}-content`}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {children}
    </div>
  );
};

export const Dialog = {
  Root,
  Header,
  Content,
};
