import remarkFrontmatter from 'remark-frontmatter';
import remarkMath from 'remark-math';

// MDX の remark 側の preset。next.config.ts の MDX と、記事を素の markdown に変換する
// apps/main の markdown.ts の両方が使い、同じ構文で読む。remark-math がないと
// $\mathbb{N}$ のような数式内の {} が MDX の式として解釈される
const remarkPreset = { plugins: [remarkMath, remarkFrontmatter] };

export default remarkPreset;
