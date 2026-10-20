import type { StudioTool } from './tool-nav';

// (authenticated) の layout から見た1つ下のセグメントを受け取る
export const toolFromSegment = (segment: string | null): StudioTool | null => {
  switch (segment) {
    case 'chat':
      return 'chat';
    case 'artifacts':
      return 'artifacts';
    default:
      return null;
  }
};
