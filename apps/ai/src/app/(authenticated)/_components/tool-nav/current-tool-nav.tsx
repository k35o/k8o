'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import type { FC } from 'react';

import { toolFromSegment } from './tool-from-segment';
import { ToolNav } from './tool-nav';

type CurrentToolNavProps = {
  onNavigate: () => void;
};

export const CurrentToolNav: FC<CurrentToolNavProps> = ({ onNavigate }) => {
  const segment = useSelectedLayoutSegment();
  return <ToolNav current={toolFromSegment(segment)} onNavigate={onNavigate} />;
};
