import { z } from 'zod';

type GaEvent = {
  readonly name: string | null;
  readonly location: string | null;
};

type SpeedInsightsMetric = {
  readonly type: string;
  readonly route: string | null;
  readonly href: string | null;
};

// GA4 は全イベントに共通の値を URL に、イベントごとの値を本文の1行ずつに書いてまとめて送る
export const gaEventsOf = (url: string, body: string | null): GaEvent[] => {
  const shared = new URL(url).searchParams;
  const lines = (body ?? '').split('\n').filter((line) => line !== '');
  const events =
    lines.length === 0
      ? [shared]
      : lines.map((line) => new URLSearchParams(line));
  return events.map((event) => ({
    name: event.get('en') ?? shared.get('en'),
    location: event.get('dl') ?? shared.get('dl'),
  }));
};

const speedInsightsSchema = z.object({
  metrics: z.array(
    z.object({
      type: z.string(),
      route: z.string().nullish(),
      href: z.string().nullish(),
    }),
  ),
});

export const speedInsightsMetricsOf = (
  body: string | null,
): SpeedInsightsMetric[] => {
  try {
    const parsed = speedInsightsSchema.safeParse(JSON.parse(body ?? ''));
    return parsed.success
      ? parsed.data.metrics.map(({ type, route, href }) => ({
          type,
          route: route ?? null,
          href: href ?? null,
        }))
      : [];
  } catch {
    return [];
  }
};
