'use server';

const JAPANESE_SYNTAX_CHECK_API =
  'https://japanese-syntax-checker.k8o.me/api';

type Request = {
  text: string;
};

type Response = {
  text: string;
  msgs: {
    type: 'lint';
    ruleId: string;
    message: string;
    index: number;
    line: number;
    column: number;
    range: number[];
    loc: {
      start: {
        line: number;
        column: number;
      };
      end: {
        line: number;
        column: number;
      };
    };
    severity: number;
  }[];
};

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
  return res.json() as Promise<Response>;
};
