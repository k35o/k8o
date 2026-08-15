import preview from '../../../../../.storybook/preview';
import { ResultTable } from './result-table';

const meta = preview.meta({
  title: 'app/contrast-checker/result-table',
  component: ResultTable,
});

export const Valid = meta.story({
  args: {
    isInvalidAaLargeText: false,
    isInvalidAaaLargeText: false,
    isInvalidAaNormalText: false,
    isInvalidAaaNormalText: false,
    compareColor: '#000000',
    baseColor: '#2dd4bf',
  },
});

export const Invalid = meta.story({
  args: {
    isInvalidAaLargeText: true,
    isInvalidAaaLargeText: true,
    isInvalidAaNormalText: true,
    isInvalidAaaNormalText: true,
    compareColor: '#000000',
    baseColor: '#2dd4bf',
  },
});

export const ValidOnlyAA = meta.story({
  args: {
    isInvalidAaLargeText: false,
    isInvalidAaaLargeText: true,
    isInvalidAaNormalText: false,
    isInvalidAaaNormalText: true,
    compareColor: '#000000',
    baseColor: '#2dd4bf',
  },
});
