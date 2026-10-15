import 'server-only';
import type { AiApp, AiUsageKind } from '@repo/ai-database/schema';

import type { GenerationModel } from '@/shared/claude/models';

import {
  insertUsageWithinLimits,
  selectCostSinceMicroUsd,
  updateUsageCost,
} from '../infrastructure/usage-repository';
import { MONTHLY_BUDGET_MICRO_USD, monthStartIso } from './budget';
import { costMicroUsd } from './pricing';
import type { UsageTokens } from './pricing';
import { generationLimit, windowStartIso } from './rate-limit';

export type UsageRefusal = 'rate-limit' | 'budget';

export type UsageReservation =
  | { ok: true; usageId: number }
  | { ok: false; reason: UsageRefusal };

export const USAGE_REFUSAL_MESSAGES: Record<UsageRefusal, string> = {
  budget: `今月の利用額が上限（$${MONTHLY_BUDGET_MICRO_USD / 1_000_000}）に達しました。翌月1日（UTC）まで使えません。`,
  'rate-limit':
    '1時間あたりの上限に達しました。しばらく待ってから送ってください。',
};

export const isMonthlyBudgetExceeded = async (now: number): Promise<boolean> =>
  (await selectCostSinceMicroUsd(monthStartIso(now))) >=
  MONTHLY_BUDGET_MICRO_USD;

// 中断した生成も数えるよう、Claude を呼ぶ前に利用の行を予約する
export const reserveUsage = async (input: {
  app: AiApp;
  kind: AiUsageKind;
  userId: string;
  model: GenerationModel;
  now: number;
}): Promise<UsageReservation> => {
  const usageId = await insertUsageWithinLimits({
    app: input.app,
    kind: input.kind,
    userId: input.userId,
    model: input.model,
    createdAt: new Date(input.now).toISOString(),
    sinceIso: windowStartIso(input.now),
    limit: generationLimit(),
    monthStartIso: monthStartIso(input.now),
    budgetMicroUsd: MONTHLY_BUDGET_MICRO_USD,
  });
  if (usageId !== null) {
    return { ok: true, usageId };
  }
  // 予約の1文はどちらの上限で断ったかを返さないので、合計を読み直して理由を決める。
  // 理由を決めるだけなので、予約との間にほかの要求が割り込んでもかまわない
  return {
    ok: false,
    reason: (await isMonthlyBudgetExceeded(input.now))
      ? 'budget'
      : 'rate-limit',
  };
};

export const recordUsage = async (input: {
  usageId: number;
  model: GenerationModel;
  tokens: UsageTokens;
}): Promise<void> => {
  await updateUsageCost({
    id: input.usageId,
    ...input.tokens,
    costMicroUsd: costMicroUsd(input.model, input.tokens),
  });
};
