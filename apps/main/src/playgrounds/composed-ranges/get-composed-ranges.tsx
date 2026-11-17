'use client';

import { Code } from '@k8ordo/ui';
import { useEffect, useRef, useState } from 'react';

import styles from './get-composed-ranges.module.css';

type Covered = { kind: 'text'; text: string } | { kind: 'unavailable' };

type Results = {
  getRangeAt: Covered;
  withShadowRoots: Covered;
  withoutShadowRoots: Covered;
};

const METHODS = [
  { key: 'getRangeAt', code: 'getRangeAt(0)' },
  { key: 'withShadowRoots', code: 'getComposedRanges({ shadowRoots })' },
  { key: 'withoutShadowRoots', code: 'getComposedRanges()' },
] as const;

const HEAD = 16;
const TAIL = 12;

const shorten = (text: string): string => {
  if (text.length <= HEAD + TAIL + 1) {
    return text;
  }
  return `${text.slice(0, HEAD)}…${text.slice(-TAIL)}`;
};

const textLengthBefore = (root: Node, node: Node, offset: number): number => {
  const range = new Range();
  range.setStart(root, 0);
  range.setEnd(node, offset);
  return range.toString().length;
};

function CoveredView({ covered }: { covered: Covered }) {
  if (covered.kind === 'unavailable') {
    return <p className={styles.empty}>rangeCountが0で、取り出せません。</p>;
  }
  if (covered.text === '') {
    return <p className={styles.empty}>（空の範囲）</p>;
  }
  return (
    <p>
      <span className={styles.covered}>{shorten(covered.text)}</span>
    </p>
  );
}

export function GetComposedRanges() {
  const sampleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const hostRef = useRef<HTMLParagraphElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    const sample = sampleRef.current;
    const label = labelRef.current;
    const host = hostRef.current;
    if (!sample || !label || !host) {
      return;
    }
    if (!shadowRef.current) {
      const shadowRoot = host.attachShadow({ mode: 'closed' });
      shadowRoot.textContent = host.textContent;
      shadowRef.current = shadowRoot;
    }
    const shadowRoot = shadowRef.current;

    const toIndex = (node: Node, offset: number): number | null => {
      const labelLength = label.textContent.length;
      const bodyLength = shadowRoot.textContent.length;
      if (node === shadowRoot || shadowRoot.contains(node)) {
        return labelLength + textLengthBefore(shadowRoot, node, offset);
      }
      if (label.contains(node)) {
        return textLengthBefore(label, node, offset);
      }
      if (node === sample) {
        const children = [...sample.childNodes];
        if (offset <= children.indexOf(label)) {
          return 0;
        }
        if (offset <= children.indexOf(host)) {
          return labelLength;
        }
        return labelLength + bodyLength;
      }
      if (node === host && offset === 0) {
        return labelLength;
      }
      if (node === host && offset === host.childNodes.length) {
        return labelLength + bodyLength;
      }
      return null;
    };

    const toCovered = (range: AbstractRange | undefined): Covered => {
      if (!range) {
        return { kind: 'unavailable' };
      }
      const start = toIndex(range.startContainer, range.startOffset);
      const end = toIndex(range.endContainer, range.endOffset);
      if (start === null || end === null) {
        return { kind: 'unavailable' };
      }
      const text = `${label.textContent}${shadowRoot.textContent}`;
      return { kind: 'text', text: text.slice(start, end) };
    };

    const handleSelectionChange = (): void => {
      const selection = document.getSelection();
      if (!selection) {
        return;
      }
      const [composed] = selection.getComposedRanges({
        shadowRoots: [shadowRoot],
      });
      const withShadowRoots = toCovered(composed);
      if (withShadowRoots.kind !== 'text' || withShadowRoots.text === '') {
        return;
      }
      setResults({
        getRangeAt: toCovered(
          selection.rangeCount > 0 ? selection.getRangeAt(0) : undefined,
        ),
        withShadowRoots,
        withoutShadowRoots: toCovered(selection.getComposedRanges()[0]),
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.sample} ref={sampleRef}>
        <p className={styles.label} ref={labelRef}>
          サンプルテキスト
          <span className={styles.note}>（本文は閉じたShadow DOMの中）</span>
        </p>
        <p ref={hostRef}>
          あさ、眼をさますときの気持は、面白い。かくれんぼのとき、押入れの真っ暗い中に、じっと、しゃがんで隠れていて、突然、でこちゃんに、がらっと襖をあけられ、日の光がどっと来て、でこちゃんに、「見つけた！」と大声で言われて、まぶしさ、それから、へんな間の悪さ、それから、胸がどきどきして、着物のまえを合せたりして、ちょっと、てれくさく、押入れから出て来て、急にむかむか腹立たしく、あの感じ、いや、ちがう、あの感じでもない、なんだか、もっとやりきれない。
        </p>
      </div>
      {results ? (
        <div className={styles.results}>
          <p className={styles.resultsLabel}>範囲が指す文字</p>
          {METHODS.map(({ key, code }) => (
            <div className={styles.result} key={key}>
              <p>
                <Code>{code}</Code>
              </p>
              <CoveredView covered={results[key]} />
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.placeholder}>
          本文の一部をドラッグして選ぶと、3つの方法で取り出した範囲がどの文字を指しているかが、ここに出ます。
        </p>
      )}
    </div>
  );
}
