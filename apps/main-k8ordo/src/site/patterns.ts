export const SLUG = '[a-z0-9-]+';

// /blog/feed はフィードの route.ts が答えるので、記事として扱わない
export const ARTICLE = '(?!feed$)[a-z0-9-]+';
