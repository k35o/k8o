import { DrizzleQueryError } from 'drizzle-orm';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// DrizzleQueryError は message（`Failed query: <SQL>\nparams: <値>`）と params に
// バインド値を平文で持ち、Better Auth のクエリではセッショントークンがそこに入る。
// Better Auth は error そのものも message の文字列も渡してくるため、両方から値を落とす。
const withoutBindValues = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return value.replace(/\nparams: [\s\S]*/u, '');
  }
  if (!(value instanceof DrizzleQueryError)) {
    return value;
  }
  const redacted = new Error(`Failed query: ${value.query}`, {
    cause: value.cause,
  });
  const frames = (value.stack ?? '')
    .split('\n')
    .filter((line) => line.trimStart().startsWith('at '));
  redacted.stack = [`Error: ${redacted.message}`, ...frames].join('\n');
  return redacted;
};

export const logAuthEvent = (
  level: LogLevel,
  message: string,
  ...args: unknown[]
): void => {
  console[level](
    withoutBindValues(`[Better Auth]: ${message}`),
    ...args.map((arg) => withoutBindValues(arg)),
  );
};
