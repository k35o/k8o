import type { SupportStatus } from '@/features/browser-support/interface/queries';

export const STATUS_META: Record<
  SupportStatus,
  { label: string; longLabel: string; tone: 'success' | 'info' | 'warning' }
> = {
  widely: { label: 'Widely', longLabel: 'Widely available', tone: 'success' },
  newly: { label: 'Newly', longLabel: 'Newly available', tone: 'info' },
  limited: {
    label: 'Limited',
    longLabel: 'Limited availability',
    tone: 'warning',
  },
};
