import {
  BadIcon,
  BoringIcon,
  DifficultIcon,
  EasyIcon,
  GoodIcon,
  InformativeIcon,
  InterestingIcon,
  ShallowIcon,
} from '@/components/icons';
import { FC } from 'react';

export type FeedbackType =
  | 'good'
  | 'bad'
  | 'interesting'
  | 'boring'
  | 'informative'
  | 'shallow'
  | 'easy'
  | 'difficult';

export const FEEDBACK_OPTIONS = [
  {
    id: 1,
    value: 'good',
    label: '良い',
    icon: GoodIcon,
  },
  {
    id: 2,
    value: 'bad',
    label: '悪い',
    icon: BadIcon,
  },
  {
    id: 3,
    value: 'informative',
    label: '有益',
    icon: InformativeIcon,
  },
  {
    id: 4,
    value: 'shallow',
    label: '浅い',
    icon: ShallowIcon,
  },
  {
    id: 5,
    value: 'interesting',
    label: '面白い',
    icon: InterestingIcon,
  },
  {
    id: 6,
    value: 'boring',
    label: '退屈',
    icon: BoringIcon,
  },
  {
    id: 7,
    value: 'easy',
    label: '簡単',
    icon: EasyIcon,
  },
  {
    id: 8,
    value: 'difficult',
    label: '難解',
    icon: DifficultIcon,
  },
] as const satisfies {
  id: number;
  value: FeedbackType;
  label: string;
  icon: FC<{ size?: 'sm' | 'md' | 'lg' }>;
}[];
