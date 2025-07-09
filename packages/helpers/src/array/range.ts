export const range = (start: number, end: number): number[] => [
  ..._range(start, end),
];

function* _range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}
