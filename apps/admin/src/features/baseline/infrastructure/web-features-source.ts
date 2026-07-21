import type * as WebFeatures from 'web-features';
import data from 'web-features/data.json';

// web-features の index.js は import.meta.url + fs で data.json を読むため、Next(Turbopack)
// のビルドで URL/path エラーになる。バンドラがそのまま解決できる data.json の直接 import に
// 切り替え、型だけ type-only の名前空間 import から借りる。ここが唯一の境界。
const { features } = data as unknown as typeof WebFeatures;

export { features };
