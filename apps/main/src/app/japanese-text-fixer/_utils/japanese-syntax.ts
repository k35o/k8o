'use server';

import * as z from 'zod/mini';

const JAPANESE_SYNTAX_CHECK_API = 'https://japanese-syntax-checker.k8o.me/api';

type Request = {
  text: string;
};

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

type Response = z.infer<typeof responseSchema>;

export const checkJapaneseSyntax = async (
  request: Request,
): Promise<Response> => {
  const res = await fetch(JAPANESE_SYNTAX_CHECK_API, {
    method: 'POST',
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    console.error(res);
    throw new Error('Network response was not ok');
  }
  return responseSchema.parse(await res.json());
};
