export const SLUG = '[a-z0-9-]+';

// 記事の動く例。例の名前は @repo/code-highlight/demo が slug と同じ文字に限る
export const DEMO_PATHNAME = `/blog/${SLUG}/demos/${SLUG}`;

// /blog/feed はフィードの route.ts が答えるので、記事として扱わない
export const ARTICLE = '(?!feed$)[a-z0-9-]+';
