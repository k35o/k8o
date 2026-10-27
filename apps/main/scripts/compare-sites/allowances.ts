import type { Target } from './targets';

type Fields = ReadonlyMap<string, string>;

export type Allowance = {
  readonly name: string;
  readonly rewrite: (base: Fields, target: Target, headUrl: string) => Fields;
};

const OG_IMAGE_FIELD =
  /^(?:meta:(?:og|twitter):image|json-ld\[\d+\]\S*\.image(?:\[\d+\])?)$/u;
const NEXT_OG_IMAGE =
  /\/opengraph-image(?:-[a-z0-9]+)?(?:\?[^\s"]*)?(?=["\s]|$)/gu;

const ogPng: Allowance = {
  name: 'og-png',
  rewrite: (base) =>
    new Map(
      [...base].map(([field, value]) => [
        field,
        OG_IMAGE_FIELD.test(field)
          ? value.replaceAll(NEXT_OG_IMAGE, '/og.png')
          : value,
      ]),
    ),
};

const NEXT_VARY_TOKEN = /^(?:rsc|next-.+)$/iu;

const varyNext: Allowance = {
  name: 'vary-next',
  rewrite: (base) => {
    const vary = base.get('header:vary');
    if (vary === undefined) {
      return base;
    }
    const tokens = vary
      .split(',')
      .map((token) => token.trim())
      .filter((token) => !NEXT_VARY_TOKEN.test(token));
    const fields = new Map(base);
    if (tokens.length === 0) {
      fields.delete('header:vary');
    } else {
      fields.set('header:vary', tokens.join(', '));
    }
    return fields;
  },
};

const ARTICLE_MARKDOWN_PATH = /^\/blog\/[a-z0-9-]+(?:\.md)?$/u;
// 本番で観測した値。関数の応答では Vercel が s-maxage を外して public だけを返し、ACAO を付けない
const FUNCTION_CACHE_CONTROL = 'public';
// 静的なファイルに Vercel が付ける値
const STATIC_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

const mdStatic: Allowance = {
  name: 'md-static',
  rewrite: (base, target) => {
    if (
      base.get('status') !== '200' ||
      base.get('content-type')?.startsWith('text/markdown') !== true ||
      !ARTICLE_MARKDOWN_PATH.test(target.path)
    ) {
      return base;
    }
    const fields = new Map(base);
    if (fields.get('header:cache-control') === FUNCTION_CACHE_CONTROL) {
      fields.set('header:cache-control', STATIC_CACHE_CONTROL);
    }
    if (!fields.has('header:access-control-allow-origin')) {
      fields.set('header:access-control-allow-origin', '*');
    }
    return fields;
  },
};

// Next が関数で描く OG には Vercel が ACAO を付けず、静的なファイルの og.png には付ける
const ogAcao: Allowance = {
  name: 'og-acao',
  rewrite: (base, _target, headUrl) => {
    if (
      base.get('content-type')?.startsWith('image/png') !== true ||
      base.has('header:access-control-allow-origin') ||
      !new URL(headUrl).pathname.endsWith('/og.png')
    ) {
      return base;
    }
    return new Map([...base, ['header:access-control-allow-origin', '*']]);
  },
};

const ALLOWANCES = [ogPng, varyNext, mdStatic, ogAcao];

export const selectAllowances = (names: readonly string[]): Allowance[] =>
  names.map((name) => {
    const allowance = ALLOWANCES.find((candidate) => candidate.name === name);
    if (allowance === undefined) {
      throw new Error(
        `--allow ${name} は無い。使える名前: ${ALLOWANCES.map((candidate) => candidate.name).join(', ')}`,
      );
    }
    return allowance;
  });

export const applyAllowances = (
  base: Fields,
  target: Target,
  headUrl: string,
  allowances: readonly Allowance[],
): Fields =>
  allowances.reduce(
    (fields, allowance) => allowance.rewrite(fields, target, headUrl),
    base,
  );
