import rehypeCodeHighlight from '@repo/code-highlight';

import rehypeMath from './rehype-math.ts';

// MDX の rehype 側の preset。数式を Temml で MathML にし、コードブロックをハイライトする
const rehypePreset = { plugins: [rehypeMath, rehypeCodeHighlight] };

export default rehypePreset;
