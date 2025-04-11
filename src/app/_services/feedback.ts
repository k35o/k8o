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
  },
  {
    id: 2,
    value: 'bad',
    label: '悪い',
  },
  {
    id: 3,
    value: 'informative',
    label: '有益',
  },
  {
    id: 4,
    value: 'shallow',
    label: '浅い',
  },
  {
    id: 5,
    value: 'interesting',
    label: '面白い',
  },
  {
    id: 6,
    value: 'boring',
    label: '退屈',
  },
  {
    id: 7,
    value: 'easy',
    label: '簡単',
  },
  {
    id: 8,
    value: 'difficult',
    label: '難解',
  },
] as const satisfies {
  id: number;
  value: FeedbackType;
  label: string;
}[];
