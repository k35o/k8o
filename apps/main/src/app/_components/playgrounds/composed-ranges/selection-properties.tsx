'use client';

import { Code, FormControl, TextField } from '@k8o/arte-odyssey';
import { useEffect, useRef, useState } from 'react';

// Selection はシングルトンで参照が変わらないため、配列で wrap して変更を検知する。
type SelectionSnapshot = [Selection] | null;

export function SelectionProperties() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [selection, setSelection] = useState<SelectionSnapshot>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry?.isIntersecting ?? false);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!inView) return undefined;
    const handler = () => {
      const current = window.getSelection();
      setSelection(current ? [current] : null);
    };
    document.addEventListener('selectionchange', handler);
    return () => {
      document.removeEventListener('selectionchange', handler);
    };
  }, [inView]);

  const current = selection?.[0];

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
        <p>{current ? current.toString() : ''}</p>
      </div>
      <div>
        <p className="font-bold">選択要素の開始位置の要素</p>
        <p className="font-bold">
          （<Code>selection.anchorNode.textContent</Code>,{' '}
          <Code>selection.anchorOffset</Code>）
        </p>
        <p>
          {current
            ? `${current.anchorNode?.textContent}, ${current.anchorOffset}`
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
          {current
            ? `${current.focusNode?.textContent}, ${current.focusOffset}`
            : ''}
        </p>
      </div>
      <div>
        <p className="font-bold">
          選択の種類（<Code>selection.type</Code>）
        </p>
        <p>{current ? current.type : ''}</p>
      </div>
    </div>
  );
}
