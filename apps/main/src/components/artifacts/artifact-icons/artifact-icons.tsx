import { BaseIcon } from '@k8ordo/ui/icons';
import type { BaseIconProps } from '@k8ordo/ui/icons';
import type { FC, ReactNode } from 'react';

type IconProps = Partial<BaseIconProps>;

// @k8ordo/ui の線のアイコンと同じ升目（16）と線の太さで描く
const LineIcon: FC<BaseIconProps & { children: ReactNode }> = ({
  size,
  children,
}) => (
  <BaseIcon
    renderItem={(props) => (
      <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.25"
        viewBox="0 0 16 16"
      >
        {children}
      </svg>
    )}
    size={size}
  />
);

export const DiceIcon: FC<IconProps> = ({ size = 'md' }) => (
  <LineIcon size={size}>
    <rect height="11" rx="2.5" width="11" x="2.5" y="2.5" />
    <path d="M5.6 5.6h.01M10.4 5.6h.01M8 8h.01M5.6 10.4h.01M10.4 10.4h.01" />
  </LineIcon>
);

export const FlameIcon: FC<IconProps> = ({ size = 'md' }) => (
  <LineIcon size={size}>
    <path d="M8.25 1.75c.5 2.5 3.75 4 3.75 7.75a4 4 0 0 1-8 0c0-1.5.6-2.6 1.5-3.5.15 1.1.65 1.8 1.4 2.15-.3-2.4.1-4.7 1.35-6.4z" />
  </LineIcon>
);

export const ClipboardCheckIcon: FC<IconProps> = ({ size = 'md' }) => (
  <LineIcon size={size}>
    <rect height="2.5" rx="0.75" width="4.5" x="5.75" y="1.75" />
    <path d="M10.25 3h1.25A1.5 1.5 0 0 1 13 4.5v8.25a1.5 1.5 0 0 1-1.5 1.5h-7a1.5 1.5 0 0 1-1.5-1.5V4.5A1.5 1.5 0 0 1 4.5 3h1.25" />
    <path d="m6 9.5 1.5 1.5 2.75-3.25" />
  </LineIcon>
);

export const PullRequestIcon: FC<IconProps> = ({ size = 'md' }) => (
  <LineIcon size={size}>
    <circle cx="4.25" cy="4" r="1.75" />
    <circle cx="11.75" cy="12" r="1.75" />
    <path d="M4.25 5.75v8M7.75 4H10a1.75 1.75 0 0 1 1.75 1.75v4.5" />
  </LineIcon>
);

// k8o のロゴのクラゲを、傘と、そろった 3 本の足で描く。k8ordo の印
export const JellyfishIcon: FC<IconProps> = ({ size = 'md' }) => (
  <LineIcon size={size}>
    <path d="M2.75 8.25a5.25 5.25 0 0 1 10.5 0z" />
    <path d="M5.25 10.75v2.75M8 10.75v2.75M10.75 10.75v2.75" />
  </LineIcon>
);
