// HTML の欄は hydrate の前から打てるが、そこで打った文字を React は欄に残すだけで onChange に
// 渡さないので、欄が付いた時に描いた値と違えば渡す
export const replayTypedValue =
  (value: string, onValueChange: (typed: string) => void) =>
  (input: HTMLInputElement | null): void => {
    if (input !== null && input.value !== value) {
      onValueChange(input.value);
    }
  };
