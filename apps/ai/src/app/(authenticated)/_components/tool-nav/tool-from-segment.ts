import type { StudioTool } from './tool-nav';

// (authenticated) の layout から見た1つ下のセグメントを受け取る。/ はページなので null になる
export const toolFromSegment = (segment: string | null): StudioTool | null => {
  switch (segment) {
    case null:
      return 'ui';
    case 'slides':
      return 'slides';
    case 'chat':
      return 'chat';
    case 'artifacts':
      return 'artifacts';
    default:
      return null;
  }
};
