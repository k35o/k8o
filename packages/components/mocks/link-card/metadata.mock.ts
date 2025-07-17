import * as actual from './../../src/link-card/metadata';
import { fn } from 'storybook/test';

export const getMetadata = fn(actual.getMetadata).mockName(
  'getMetadata',
);
