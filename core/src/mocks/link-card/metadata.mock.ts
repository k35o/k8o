import * as actual from '@/app/_components/link-card/metadata';
import { fn } from 'storybook/test';

export const getMetadata = fn(actual.getMetadata).mockName(
  'getMetadata',
);
