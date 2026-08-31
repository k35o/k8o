import type { HtmlElementInfo } from '@k8o/html-nest';
import { Alert } from '@k8ordo/ui';
import type { FC, ReactNode } from 'react';

const NoteBox: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="text-fg-mute border-border-mute bg-bg-subtle rounded-lg border px-4 py-3 text-sm leading-relaxed">
    {children}
  </div>
);

// 選択要素の content model 種別に応じた「子要素についての説明」。
// elements（通常）のときは null を返し、呼び出し側で子リストを描画する。
export const SpecialContentNotice: FC<{ element: HtmlElementInfo }> = ({
  element,
}) => {
  const { kind, note } = element.contentModel;

  // 要素固有の note はそれ自体が完結した説明なので、あれば種別共通の文言より優先する
  // （iframe の「内容は Nothing。…」と汎用文の Nothing が重複するのを避ける）。
  // note は句点なしで書かれているため、ここで「。」を補う。
  const noteOr = (fallback: string): string =>
    note === undefined ? fallback : `${note}。`;

  if (kind === 'transparent') {
    const messages = [
      '透過コンテンツです。中に入れられる要素は「この要素を置いた親」が許す内容に従います。下の一覧は目安で、すべて文脈しだいの条件付きです。',
    ];
    if (note !== undefined) {
      messages.push(`${note}。`);
    }
    return <Alert message={messages} tone="info" />;
  }
  if (kind === 'empty') {
    return <NoteBox>空要素（void）のため、子要素を持てません。</NoteBox>;
  }
  if (kind === 'none') {
    return (
      <NoteBox>
        {noteOr('許可される内容はありません（content model: Nothing）。')}
      </NoteBox>
    );
  }
  if (kind === 'text') {
    return (
      <NoteBox>
        {noteOr('テキストのみを入れられます。要素は入れられません。')}
      </NoteBox>
    );
  }
  if (kind === 'varies') {
    return (
      <NoteBox>{noteOr('文脈によって入れられる内容が変化します。')}</NoteBox>
    );
  }
  if (kind === 'foreign') {
    return (
      <Alert
        message="SVG / MathML の名前空間の規則に従います。このマップの対象外です。"
        tone="warning"
      />
    );
  }
  return null;
};
