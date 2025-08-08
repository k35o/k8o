import { fn } from 'storybook/test';
import * as actual from '@/app/_components/link-card/metadata';

export const getMetadata = fn(actual.getMetadata).mockName('getMetadata');
