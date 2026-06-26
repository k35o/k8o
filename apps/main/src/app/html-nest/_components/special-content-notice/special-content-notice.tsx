import { Alert } from '@k8o/arte-odyssey';
import type { FC, ReactNode } from 'react';

import type { HtmlElementInfo } from '../../_types/html-element';

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
  const { contentModel } = element;
  const { kind } = contentModel;

  if (kind === 'transparent') {
    const messages = [
      '透過コンテンツです。中に入れられる要素は「この要素を置いた親」が許す内容に従います。下の一覧は目安で、すべて文脈しだいの条件付きです。',
    ];
    if (contentModel.note !== undefined) {
      messages.push(contentModel.note);
    }
    return <Alert message={messages} tone="info" />;
  }
  if (kind === 'empty') {
    return <NoteBox>空要素（void）のため、子要素を持てません。</NoteBox>;
  }
  if (kind === 'none') {
    return (
      <NoteBox>
        許可される内容はありません（content model:
        Nothing）。DOM上の子は空で、書いた内容は content の DocumentFragment
        に格納されます。
      </NoteBox>
    );
  }
  if (kind === 'text') {
    return (
      <NoteBox>テキストのみを入れられます。要素は入れられません。</NoteBox>
    );
  }
  if (kind === 'varies') {
    return (
      <NoteBox>
        文脈によって入れられる内容が変化します（スクリプトの有効・無効など）。
      </NoteBox>
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
