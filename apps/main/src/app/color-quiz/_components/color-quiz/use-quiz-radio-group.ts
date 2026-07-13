import { type KeyboardEvent, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';

type Params = {
  options: readonly string[];
  selectedHex: string | null;
  onSelect: (hex: string) => void;
};

// クイズの選択肢は「4択から1つ」の排他選択なので、WAI-ARIA の radiogroup として
// 実装する。roving tabindex（タブ移動先は1つ）と矢印/Home/End キーでの選択移動
// （selection follows focus）を提供し、各ボタンに radio ロールの props を配る。
export const useQuizRadioGroup = ({
  options,
  selectedHex,
  onSelect,
}: Params) => {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);
  // ref コールバックはインライン生成すると毎コミットで detach/attach が走るため、
  // index ごとに安定したコールバックを一度だけ生成して使い回す
  const refSetters = useRef<Array<(el: HTMLButtonElement | null) => void>>([]);
  const getRefSetter = (index: number) => {
    refSetters.current[index] ??= (el: HTMLButtonElement | null) => {
      buttonsRef.current[index] = el;
    };
    return refSetters.current[index];
  };

  const selectedIndex =
    selectedHex === null ? -1 : options.indexOf(selectedHex);
  // 未選択のときは先頭をタブ移動先にする（APG の推奨）
  const activeIndex = Math.max(selectedIndex, 0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const last = options.length - 1;
      let next: number;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = index === last ? 0 : index + 1;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = index === 0 ? last : index - 1;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = last;
          break;
        default:
          return;
      }
      event.preventDefault();
      const hex = options[next];
      if (hex === undefined) {
        return;
      }
      onSelect(hex);
      buttonsRef.current[next]?.focus();
    },
    [options, onSelect],
  );

  // 「次の問題へ」で状態を更新した直後に、先頭の選択肢へフォーカスを移す。
  // state 更新は本来非同期でバッチされ、直後に focus すると更新前（選択肢がまだ
  // disabled）の DOM を掴むため flushSync で確定させてから focus する。これにより
  // 回答ボタンが disabled 化してフォーカスが body へ落ちるのを防ぐ。副作用を effect
  // ではなくクリックイベントの結果として扱うことで StrictMode の二重実行も無関係になる。
  const focusFirstOptionAfter = useCallback((update: () => void) => {
    flushSync(update);
    buttonsRef.current[0]?.focus();
  }, []);

  const getRadioProps = (hex: string, index: number) => ({
    role: 'radio' as const,
    'aria-checked': selectedHex === hex,
    tabIndex: index === activeIndex ? 0 : -1,
    ref: getRefSetter(index),
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      handleKeyDown(event, index);
    },
  });

  return { getRadioProps, focusFirstOptionAfter };
};
