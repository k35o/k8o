import { useRef, useState } from 'react';

const SETTLE_MS = 600;

// 動かしている間の値は下書きに置き、確定の時点で URL へ書く。入力ごとに navigate すると WebKit は 200 回で
// QuotaExceededError を返し、URL が止まる。根の要素に commitProps を渡すと、部品の onChange のあとに届く
// pointerup・pointercancel・click・keyup・blur で確定する。ポインタもキーも出ない増減と、離した直後の
// pointermove が作る下書きにはどれも来ないので、止まって SETTLE_MS たったら書く
export const useUrlDraft = <Values extends object>(
  committed: Values,
  write: (patch: Partial<Values>) => unknown,
) => {
  const [draft, setDraft] = useState<Partial<Values> | null>(null);
  // pointermove は discrete でないので、確定のときに最後の render の値が古いことがある
  const latest = useRef<Partial<Values> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const commit = (patch?: Partial<Values>): void => {
    clearTimeout(settleTimer.current);
    if (latest.current === null && patch === undefined) {
      return;
    }
    write({ ...latest.current, ...patch });
    latest.current = null;
    setDraft(null);
  };

  const flush = (): void => {
    commit();
  };

  const change = (
    patch: Partial<Values> | ((current: Values) => Partial<Values>),
  ): void => {
    const current = { ...committed, ...latest.current };
    latest.current = {
      ...latest.current,
      ...(typeof patch === 'function' ? patch(current) : patch),
    };
    setDraft(latest.current);
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(flush, SETTLE_MS);
  };

  return {
    values: { ...committed, ...draft },
    change,
    commit,
    commitProps: {
      onBlur: flush,
      onClick: flush,
      onKeyUp: flush,
      onPointerCancel: flush,
      onPointerUp: flush,
    },
  };
};
