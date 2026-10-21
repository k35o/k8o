// 改行とタブ以外の制御文字と、ゼロ幅文字・双方向制御・タグ文字・異体字セレクタなど
// 表示されない文字。第三者の文章に見えない文字で指示を紛れ込ませる手口を、モデルに
// 渡す前に減らす
const INVISIBLE_CHARS =
  /(?![\n\t])[\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/gu;

// UTF-16 のコード単位で切るとサロゲートペアが分断されるため、コードポイント単位で数える
export const toUntrustedText = (value: string, maxLength: number): string =>
  Array.from(value.replaceAll(INVISIBLE_CHARS, ''))
    .slice(0, maxLength)
    .join('');
