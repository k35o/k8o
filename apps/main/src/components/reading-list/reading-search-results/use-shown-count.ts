import {
  startTransition,
  useEffect,
  useEffectEvent,
  useState,
  useSyncExternalStore,
} from 'react';

const FIRST_PAINT_COUNT = 20;
const BATCH_COUNT = 50;

const subscribeNavigation = (onChange: () => void): (() => void) => {
  // navigation.transition は、navigatesuccess と navigateerror を配り終えてから null になる
  const onSettled = (): void => {
    queueMicrotask(onChange);
  };
  navigation.addEventListener('currententrychange', onChange);
  navigation.addEventListener('navigatesuccess', onSettled);
  navigation.addEventListener('navigateerror', onSettled);
  return () => {
    navigation.removeEventListener('currententrychange', onChange);
    navigation.removeEventListener('navigatesuccess', onSettled);
    navigation.removeEventListener('navigateerror', onSettled);
  };
};

const isTraversing = (): boolean =>
  navigation.transition?.navigationType === 'traverse';

/**
 * 一覧の先頭から描く件数。数百件を一度に描くと、DOM を作るのも並べるのも 1 つの長いタスクになるので、
 * 初めは画面を埋める先頭だけを描き、残りはフレームごとに次の件数を足して、短いタスクに分けて描く。
 * 戻る・進むでは、ルーターが描いた直後に前のスクロールの位置へ戻すので、全件を一度に描いて高さをそろえる
 */
export const useShownCount = (total: number): number => {
  const traversing = useSyncExternalStore(subscribeNavigation, isTraversing);
  const [count, setCount] = useState(
    traversing ? Number.POSITIVE_INFINITY : FIRST_PAINT_COUNT,
  );
  const isAllShown = count >= total;
  // transition の更新は、描き終える前に同じ state へ重ねたものとまとめて描かれる。前の分を描き終える前に
  // 次のフレームが来ても 1 回分だけ足すよう、足す前の値を描き終えた件数から取る
  const addBatch = useEffectEvent((): void => {
    startTransition(() => {
      setCount(count + BATCH_COUNT);
    });
  });
  useEffect(() => {
    if (isAllShown) {
      return undefined;
    }
    let frame = requestAnimationFrame(function onFrame(): void {
      addBatch();
      frame = requestAnimationFrame(onFrame);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isAllShown]);
  return count;
};
