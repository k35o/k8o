// OGP メタデータ取得は SSRF 対策込みで @repo/helpers に集約している。
// この feature の infrastructure 境界として薄く再エクスポートする。
export { fetchOgMetadata } from '@repo/helpers/og/fetch-og-metadata';
