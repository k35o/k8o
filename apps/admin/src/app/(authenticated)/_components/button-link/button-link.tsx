'use client';

import { Button } from '@k8o/arte-odyssey';
import type { Route } from 'next';
import Link from 'next/link';
import type { ComponentProps, FC, ReactNode } from 'react';

type ButtonProps = ComponentProps<typeof Button>;

type ButtonLinkProps = {
  href: Route;
  color: NonNullable<ButtonProps['color']>;
  variant: NonNullable<ButtonProps['variant']>;
  size: NonNullable<ButtonProps['size']>;
  children: ReactNode;
};

// arte-odyssey の Button を next/link として描画する共通パターン。
// renderItem で Link を差し込むボイラープレートを集約する。
export const ButtonLink: FC<ButtonLinkProps> = ({
  href,
  color,
  variant,
  size,
  children,
}) => (
  <Button
    color={color}
    renderItem={({ className, children: content }) => (
      <Link className={className} href={href}>
        {content}
      </Link>
    )}
    size={size}
    variant={variant}
  >
    {children}
  </Button>
);
