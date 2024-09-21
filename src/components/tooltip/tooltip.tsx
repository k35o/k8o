'use client';

import { FC, PropsWithChildren, ReactElement } from 'react';
import { Popover } from '../popover';
import { Placement } from '@floating-ui/react';
import { usePlacement } from '../popover/hooks';

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
        <section
          {...props}
          className="rounded-xl border border-borderSecondary bg-bgBase px-4 py-2 shadow-xl"
        >
          {children}
        </section>
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
          translateX: 0,
          translateY: 0,
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
