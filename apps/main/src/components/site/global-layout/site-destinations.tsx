import { href } from '@k8ordo/framework';
import {
  BlendIcon,
  BookTextIcon,
  ListIcon,
  PackageIcon,
  PaletteIcon,
  PresentationIcon,
  ShieldCheckIcon,
} from '@k8ordo/ui/icons';

export const LINKS = [
  { label: 'Blog', path: href('/blog'), icon: <BookTextIcon size="md" /> },
  {
    label: 'Talks',
    path: href('/talks'),
    icon: <PresentationIcon size="md" />,
  },
  {
    label: 'Artifacts',
    path: href('/artifacts'),
    icon: <PackageIcon size="md" />,
  },
  {
    label: 'Readings',
    path: href('/reading-list'),
    icon: <ListIcon size="md" />,
  },
] as const;

export const LAB = [
  {
    label: 'カラーHexクイズ',
    path: href('/color-quiz'),
    description: '色を見て Hex コードを当てる。',
    icon: <BlendIcon size="md" />,
    external: false,
  },
  {
    label: 'fluida',
    path: 'https://fluida.k8o.me',
    description: '絵の具を流して模様を描く。',
    icon: <PaletteIcon size="md" />,
    external: true,
  },
  {
    label: 'Browser Support',
    path: href('/browser-support'),
    description: 'Web の機能のブラウザ対応を追う。',
    icon: <ShieldCheckIcon size="md" />,
    external: false,
  },
] as const;

export const isInLab = (
  pathname: string,
  currentOf: (pathname: string, path: string) => unknown,
): boolean => LAB.some(({ path }) => currentOf(pathname, path) !== undefined);
