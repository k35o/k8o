import type { GenerationModel } from '@/shared/claude/models';

import type { AgentUIMessage } from './agent-message';

export type ThreadSnapshot =
  | { running: true }
  | { running: false; messages: AgentUIMessage[] };

export type ThreadListItem = {
  id: string;
  title: string;
  model: GenerationModel | null;
  updatedAt: string;
  running: boolean;
};

export type LoadedThread = {
  id: string;
  title: string;
  model: GenerationModel;
  running: boolean;
  messages: AgentUIMessage[];
};
