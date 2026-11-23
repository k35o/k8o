export const splitNotes = (text: string): string[] =>
  text.split(/^---[ \t]*$/mu).map((notes) => notes.trim());
