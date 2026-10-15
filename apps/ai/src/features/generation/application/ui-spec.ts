import { isDeepStrictEqual } from 'node:util';

import { buildUserPrompt } from '@json-render/core';
import type { Spec } from '@json-render/core';
import { validateGeneratedSpec } from '@k8ordo/ui/json-render';
import type { GeneratedSpecIssue } from '@k8ordo/ui/json-render';

import { parseSpecProse, toSpec } from './spec-message';

export type UiSpecDraft = {
  spec: Spec | null;
  appliedPatchCount: number;
  prose: string;
};

type UiSpecReady = { type: 'ready'; spec: Spec; summary: string };

type UiSpecRepair = {
  type: 'repair';
  base: Spec | null;
  userPrompt: string;
  reason: string;
  summary: string;
};

type UiSpecSettlement =
  | UiSpecReady
  | UiSpecRepair
  | { type: 'no-change'; summary: string };

const UNBUILT_REASON = 'パッチから spec を組み立てられませんでした';
const UNBUILT_REPAIR =
  '前の出力は、パッチから spec を組み立てられなかった。/root と /elements をすべて出し直すこと';
const MAX_REASON_ISSUES = 3;
const MAX_ISSUE_CHARS = 120;

export const uiUserPrompt = (input: {
  instruction: string;
  base: Spec | null;
}): string =>
  input.base === null
    ? input.instruction
    : buildUserPrompt({ prompt: input.instruction, currentSpec: input.base });

// サロゲートペアを途中で切らないよう、UTF-16 の長さではなく文字で数える
const truncateIssue = (issue: string): string => {
  const chars = Array.from(issue);
  return chars.length <= MAX_ISSUE_CHARS
    ? issue
    : `${chars.slice(0, MAX_ISSUE_CHARS).join('')}…`;
};

const describeIssues = (issues: GeneratedSpecIssue[]): string =>
  issues
    .slice(0, MAX_REASON_ISSUES)
    .map((issue) =>
      truncateIssue(
        issue.elementKey === undefined
          ? issue.message
          : `[${issue.elementKey}] ${issue.message}`,
      ),
    )
    .join(' / ');

export const settleUiSpec = (input: {
  draft: UiSpecDraft;
  base: Spec | null;
  instruction: string;
}): UiSpecSettlement => {
  const { draft, base } = input;
  const summary = parseSpecProse(draft.prose).description;
  if (
    draft.appliedPatchCount === 0 ||
    (base !== null && isDeepStrictEqual(draft.spec, base))
  ) {
    return { type: 'no-change', summary };
  }
  if (draft.spec === null) {
    return {
      type: 'repair',
      base,
      userPrompt: uiUserPrompt({
        instruction: `${input.instruction}\n\n${UNBUILT_REPAIR}`,
        base,
      }),
      reason: UNBUILT_REASON,
      summary,
    };
  }
  const validated = validateGeneratedSpec(draft.spec);
  if (!validated.ok) {
    return {
      type: 'repair',
      base: draft.spec,
      userPrompt: buildUserPrompt({
        prompt: validated.repairPrompt,
        currentSpec: draft.spec,
      }),
      reason: describeIssues(validated.issues),
      summary,
    };
  }
  return { type: 'ready', spec: toSpec(validated.spec), summary };
};

export const settleUiRepair = (input: {
  repair: UiSpecRepair;
  draft: UiSpecDraft;
  instruction: string;
}): UiSpecReady | { type: 'failed'; reason: string } => {
  const settled = settleUiSpec({
    draft: input.draft,
    base: input.repair.base,
    instruction: input.instruction,
  });
  switch (settled.type) {
    case 'ready':
      return {
        ...settled,
        summary:
          input.repair.summary === '' ? settled.summary : input.repair.summary,
      };
    case 'repair':
      return { type: 'failed', reason: settled.reason };
    case 'no-change':
      return { type: 'failed', reason: input.repair.reason };
  }
};
