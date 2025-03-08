import { Heading } from '../heading';
import { IconButton } from '../icon-button';
import { CloseIcon } from '../icons';
import {
  createContext,
  FC,
  PropsWithChildren,
  Ref,
  use,
  useId,
} from 'react';

const DialogContext = createContext<{
  rootId: string;
} | null>(null);

const useDialogContext = () => {
  const context = use(DialogContext);
  if (context === null) {
    throw new Error(
      'useDialogContext must be used within a DialogProvider',
    );
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
      ref={ref}
      id={id}
      aria-labelledby={`${rootId}-header`}
      aria-describedby={`${rootId}-content`}
      role={role}
      tabIndex={tabIndex}
      className="bg-bg-base relative w-full rounded-lg shadow-xl"
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
      id={`${rootId}-header`}
      className="flex items-center justify-center p-4 pb-0"
    >
      <Heading type="h3">{title}</Heading>
      <div className="absolute top-2 right-2">
        <IconButton
          aria-label="閉じる"
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
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- 参考:https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/no-static-element-interactions.md#case-the-event-handler-is-only-being-used-to-capture-bubbled-events
    <div
      id={`${rootId}-content`}
      className="p-4"
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
