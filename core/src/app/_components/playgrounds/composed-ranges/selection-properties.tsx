'use client';

import { Code } from '@k8o/arte-odyssey/code';
import { FormControl } from '@k8o/arte-odyssey/form/form-control';
import { TextField } from '@k8o/arte-odyssey/form/text-field';
import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export function SelectionProperties() {
  // Selectionオブジェクトはユニークなので、配列として保持して変更が起きた時に再レンダリングするようにする
  const [selection, setSelection] = useState<[Selection] | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    const handleChange = () => {
      if (!inView) {
        return;
      }
      const selection = window.getSelection();
      setSelection(selection ? [selection] : null);
    };

    document.addEventListener('selectionchange', handleChange);
    return () => {
      document.removeEventListener('selectionchange', handleChange);
    };
  }, [inView]);

  return (
    <div className="flex flex-col gap-4" ref={ref}>
      <div className="flex flex-col">
        <p className="font-bold">サンプルテキスト</p>
        <p>
          あさ、眼をさますときの気持は、面白い。かくれんぼのとき、押入れの真っ暗い中に、じっと、しゃがんで隠れていて、突然、でこちゃんに、がらっと襖をあけられ、日の光がどっと来て、でこちゃんに、「見つけた！」と大声で言われて、まぶしさ、それから、へんな間の悪さ、それから、胸がどきどきして、着物のまえを合せたりして、ちょっと、てれくさく、押入れから出て来て、急にむかむか腹立たしく、あの感じ、いや、ちがう、あの感じでもない、なんだか、もっとやりきれない。
        </p>
      </div>
      <FormControl
        label="サンプルインプット"
        renderInput={(props) => <TextField {...props} />}
      />
      <div>
        <p className="font-bold">
          選択中のテキスト（<Code>selection.toString()</Code>）
        </p>
        <p>{selection ? selection[0].toString() : ''}</p>
      </div>
      <div>
        <p className="font-bold">選択要素の開始位置の要素</p>
        <p className="font-bold">
          （<Code>selection.anchorNode.textContent</Code>,{' '}
          <Code>selection.anchorOffset</Code>）
        </p>
        <p>
          {selection
            ? `${selection[0].anchorNode?.textContent}, ${selection[0].anchorOffset}`
            : ''}
        </p>
      </div>
      <div>
        <p className="font-bold">選択要素の終了位置の要素</p>
        <p className="font-bold">
          （<Code>selection.focusNode.textContent</Code>,{' '}
          <Code>selection.focusOffset</Code>）
        </p>
        <p>
          {selection
            ? `${selection[0].focusNode?.textContent}, ${selection[0].focusOffset}`
            : ''}
        </p>
      </div>
      <div>
        <p className="font-bold">
          選択の種類（<Code>selection.type</Code>）
        </p>
        <p>{selection ? selection[0].type : ''}</p>
      </div>
    </div>
  );
}
