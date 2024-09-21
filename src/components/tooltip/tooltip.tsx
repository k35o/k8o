'use client';

import { FC, PropsWithChildren, ReactElement } from 'react';
import { Popover } from '../popover';
import { Placement } from '@floating-ui/react';

const Root: FC<PropsWithChildren<{ placement?: Placement }>> = ({
  children,
  placement = 'bottom-start',
}) => {
  return (
    <Popover.Root placement={placement} type="tooltip">
      {children}
    </Popover.Root>
  );
};

const Trigger: FC<{
  renderItem: (props: Record<string, unknown>) => ReactElement;
}> = ({ renderItem }) => {
  return (
    <Popover.Trigger
      renderItem={(props) =>
        renderItem({ ...props.actionProps, ...props.restProps })
      }
    />
  );
};

const Content: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Popover.Content
      renderItem={(props) => (
        <section
          {...props}
          className="rounded-xl border border-borderSecondary bg-bgBase px-4 py-2 shadow-xl"
        >
          {children}
        </section>
      )}
    />
  );
};

export const Tooltip = {
  Root,
  Trigger,
  Content,
};
