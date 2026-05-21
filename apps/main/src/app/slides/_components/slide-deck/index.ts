// slide-deck/ は内部実装。外部から触る公開面は SlideDeck (dispatcher) のみ。
// hooks / stage / nav-button 等は内部利用なので barrel から出さない。
// splitSlides / Slide 型は features/slides/application から直接 import する。
export { SlideDeck } from './slide-deck';
