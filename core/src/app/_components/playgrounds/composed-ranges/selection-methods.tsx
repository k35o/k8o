'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { Code } from '@k8o/arte-odyssey/code';
import { useRef } from 'react';

export function SelectionMethods() {
  const textRef = useRef<HTMLParagraphElement>(null);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <p className="font-bold">サンプルテキスト</p>
        <p ref={textRef}>
          あさ、眼をさますときの気持は、面白い。かくれんぼのとき、押入れの真っ暗い中に、じっと、しゃがんで隠れていて、突然、でこちゃんに、がらっと襖をあけられ、日の光がどっと来て、でこちゃんに、「見つけた！」と大声で言われて、まぶしさ、それから、へんな間の悪さ、それから、胸がどきどきして、着物のまえを合せたりして、ちょっと、てれくさく、押入れから出て来て、急にむかむか腹立たしく、あの感じ、いや、ちがう、あの感じでもない、なんだか、もっとやりきれない。
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <p className="font-bold">選択範囲の追加</p>
          <p className="font-bold">
            （<Code>selection.addRange(Range)</Code>）
          </p>
        </div>
        <Button
          onClick={() => {
            const selection = window.getSelection();
            const textNode = textRef.current?.firstChild;
            if (selection && textNode) {
              if (selection.rangeCount > 0) {
                selection.removeAllRanges();
              }
              const range = new Range();
              range.setStart(textNode, 54);
              range.setEnd(textNode, 63);
              selection.addRange(range);
            }
          }}
        >
          「突然、でこちゃんに」を選択する
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <p className="font-bold">選択範囲の削除</p>
          <p className="font-bold">
            （<Code>selection.removeAllRanges()</Code>,{' '}
            <Code>selection.empty()</Code>）
          </p>
        </div>
        <Button
          onClick={() => {
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
            }
          }}
        >
          選択範囲を削除する
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <p className="font-bold">要素の子を全て選択する</p>
          <p className="font-bold">
            （<Code>selection.selectAllChildren(Node)</Code>）
          </p>
        </div>
        <Button
          onClick={() => {
            const selection = window.getSelection();
            if (selection && textRef.current) {
              selection.removeAllRanges();
              selection.selectAllChildren(textRef.current);
            }
          }}
        >
          要素の子を全て選択する
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <p className="font-bold">範囲の変更</p>
          <p className="font-bold">
            （<Code>selection.extend(Node, ?offset)</Code>）
          </p>
        </div>
        <Button
          onClick={() => {
            const selection = window.getSelection();
            if (selection && textRef.current) {
              selection.extend(textRef.current);
            }
          }}
        >
          現在の選択範囲をサンプルテキストの先頭までに拡張する
        </Button>
      </div>
    </div>
  );
}
