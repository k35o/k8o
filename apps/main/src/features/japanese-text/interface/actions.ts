'use server';

import * as z from 'zod/mini';

const JAPANESE_SYNTAX_CHECK_API = 'https://japanese-syntax-checker.k8o.me/api';

const responseSchema = z.object({
  text: z.string(),
  msgs: z.array(
    z.object({
      type: z.literal('lint'),
      ruleId: z.string(),
      message: z.string(),
      index: z.number(),
      line: z.number(),
      column: z.number(),
      range: z.array(z.number()),
      loc: z.object({
        start: z.object({ line: z.number(), column: z.number() }),
        end: z.object({ line: z.number(), column: z.number() }),
      }),
      severity: z.number(),
    }),
  ),
});

type SyntaxCheckResult = z.infer<typeof responseSchema>;

export const checkJapaneseSyntax = async (request: {
  text: string;
}): Promise<SyntaxCheckResult> => {
  const res = await fetch(JAPANESE_SYNTAX_CHECK_API, {
    method: 'POST',
    body: JSON.stringify({ text: request.text }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(
      `日本語構文チェックAPIが異常応答を返しました (status: ${res.status})`,
    );
  }
  return responseSchema.parse(await res.json());
};
