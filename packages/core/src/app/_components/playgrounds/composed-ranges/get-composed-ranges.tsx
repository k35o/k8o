'use client';

import { Button } from '@k8o/arte-odyssey/button';
import { Code } from '@k8o/arte-odyssey/code';
import { useEffect, useRef, useState } from 'react';

export function GetComposedRanges() {
  const ref = useRef<HTMLParagraphElement>(null);
  const shadow = useRef<ShadowRoot | null>(null);

  const [ranges, setRanges] = useState<
    [Range, StaticRange, StaticRange] | null
  >(null);

  useEffect(() => {
    if (ref.current && !shadow.current) {
      const innerHTML1 = ref.current.innerHTML;
      const shadowRoot1 = ref.current.attachShadow({ mode: 'closed' });
      shadowRoot1.innerHTML = innerHTML1;
      shadow.current = shadowRoot1;
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <p className="font-bold">
          サンプルテキスト
          <span className="text-fg-mute text-sm">
            （テキスト全体が閉じたShadow Tree）
          </span>
        </p>
        <p ref={ref}>
          あさ、眼をさますときの気持は、面白い。
          <span style={{ backgroundColor: '#dbeafe', color: '#18181b' }}>
            かくれんぼのとき
            、押入れの真っ暗い中に、じっと、しゃがんで隠れていて、突然、でこちゃんに、がらっと襖をあけられ、日の光がどっと来て、でこちゃんに、「見つけた！」と大声で言われて
          </span>
          、まぶしさ、それから、へんな間の悪さ、それから、胸がどきどきして、着物のまえを合せたりして、ちょっと、てれくさく、押入れから出て来て、急にむかむか腹立たしく、あの感じ、いや、ちがう、あの感じでもない、なんだか、もっとやりきれない。
        </p>
      </div>
      {ranges && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <p className="font-bold">
              <Code>selection.getRangeAt(0)</Code>
            </p>
            <div>
              <p className="font-bold">
                <Code>range.startContainer.textContent</Code>,{' '}
                <Code>range.startOffset</Code>
              </p>
              <p>
                {`${ranges[0].startContainer.textContent}, ${ranges[0].startOffset}`}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-bold">
                <Code>range.endContainer.textContent</Code>,{' '}
                <Code>range.endOffset</Code>
              </p>
              <p>
                {`${ranges[0].endContainer.textContent}, ${ranges[0].endOffset}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold">
              <Code>selection.getComposedRanges(options)[0]</Code>
            </p>
            <div>
              <p className="font-bold">
                <Code>range.startContainer.textContent</Code>,{' '}
                <Code>range.startOffset</Code>
              </p>
              <p>
                {`${ranges[1].startContainer.textContent}, ${ranges[1].startOffset}`}
              </p>
            </div>
            <div>
              <p className="font-bold">
                <Code>range.endContainer.textContent</Code>,{' '}
                <Code>range.endOffset</Code>
              </p>
              <p>
                {`${ranges[1].endContainer.textContent}, ${ranges[1].endOffset}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold">
              <Code>selection.getComposedRanges()[0]</Code>
            </p>
            <div>
              <p className="font-bold">
                <Code>range.startContainer.textContent</Code>,{' '}
                <Code>range.startOffset</Code>
              </p>
              <p>
                {`${ranges[2].startContainer.textContent}, ${ranges[2].startOffset}`}
              </p>
            </div>
            <div>
              <p className="font-bold">
                <Code>range.endContainer.textContent</Code>,{' '}
                <Code>range.endOffset</Code>
              </p>
              <p>
                {`${ranges[2].endContainer.textContent}, ${ranges[2].endOffset}`}
              </p>
            </div>
          </div>
        </div>
      )}
      <Button
        disabled={window.getSelection()?.rangeCount === 0}
        onClick={() => {
          const selection = window.getSelection();
          if (selection && shadow.current && selection.rangeCount > 0) {
            const range1 = selection.getRangeAt(0);
            console.log(selection.getComposedRanges());
            const range2 = selection.getComposedRanges({
              shadowRoots: [shadow.current],
            })[0];
            const range3 = selection.getComposedRanges()[0];
            if (range2 && range3) {
              setRanges([range1, range2, range3]);
            }
          }
        }}
      >
        選択範囲のテキストを取得する
      </Button>
      <p className="text-fg-mute text-sm">
        SafariやIOSのChrome等ではoptionsを含んだgetComposedRangesメソッドが正しく動作しない場合があります。
      </p>
    </div>
  );
}
