import type { GenerationTokens } from '../infrastructure/usage-repository';

export type StepUsage = {
  usage: { inputTokens: number | undefined; outputTokens: number | undefined };
};

const sumKnown = (values: Array<number | undefined>): number | null => {
  const known = values.filter((value) => value !== undefined);
  return known.length === 0
    ? null
    : known.reduce((total, value) => total + value, 0);
};

export const sumStepTokens = (
  steps: readonly StepUsage[],
): GenerationTokens => ({
  inputTokens: sumKnown(steps.map((step) => step.usage.inputTokens)),
  outputTokens: sumKnown(steps.map((step) => step.usage.outputTokens)),
});
