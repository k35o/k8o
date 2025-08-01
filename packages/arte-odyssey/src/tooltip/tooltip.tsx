'use client';

import { Popover } from '../popover';
import { usePlacement } from '../popover/hooks';
import { Placement } from '@floating-ui/react';
import { FC, PropsWithChildren, ReactElement } from 'react';

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
      renderItem={(props) => renderItem({ ...props })}
    />
  );
};

const Content: FC<PropsWithChildren> = ({ children }) => {
  const placement = usePlacement();
  const translate = {
    top: { translateY: 5 },
    bottom: { translateY: -5 },
    left: { translateX: 5 },
    right: { translateX: -5 },
  }[
    placement.includes('-')
      ? (placement.split('-')[0] ?? 'bottom')
      : placement
  ];

  return (
    <Popover.Content
      renderItem={(props) => (
        <div
          {...props}
          className="border-border-mute bg-bg-base rounded-lg border px-4 py-2 shadow-xl"
        >
          {children}
        </div>
      )}
      motionVariants={{
        closed: {
          ...translate,
          opacity: 0,
          transition: {
            duration: 0.3,
          },
        },
        open: {
          translate: 0,
          opacity: 1,
          transition: {
            duration: 0.4,
            ease: 'easeOut',
          },
        },
      }}
    />
  );
};

export const Tooltip = {
  Root,
  Trigger,
  Content,
};
