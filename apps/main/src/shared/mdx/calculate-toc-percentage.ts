import type { HeadingTree } from './types';

/**
 * 目次の階層構造から現在の進捗率を計算する
 * その見出しに到達するまでの進捗（直前まで）を返す
 *
 * @param activeId - 現在アクティブな見出しのテキスト
 * @param headingTree - 見出しの階層構造
 * @returns 進捗率（0-100）
 *
 * @example
 * // depth1が4つあり、2つ目のdepth1にいる場合（1つ目を読み終わった地点）
 * calculateTocPercentage('見出し2', tree) // => 25
 *
 * @example
 * // depth1が4つ、2つ目のdepth1に5つのdepth2があり、3つ目のdepth2にいる場合
 * // 25% + 5% * 2 = 35%（2つ目のdepth2まで読み終わった地点）
 * calculateTocPercentage('見出し2-3', tree) // => 35
 */
export const calculateTocPercentage = (
  activeId: string,
  headingTree: HeadingTree,
): number => {
  if (activeId === '') return 0;

  // activeIdがどの階層のどこにあるかを探す
  let depth1Index = -1;
  let depth2Index = -1;
  let depth3Index = -1;
  let totalDepth1 = 0;
  let totalDepth2 = 0;
  let totalDepth3 = 0;

  // 各階層を探索
  for (let i = 0; i < headingTree.children.length; i++) {
    const depth1 = headingTree.children[i];
    if (!depth1) continue;

    if (depth1.text === activeId) {
      depth1Index = i;
      totalDepth1 = headingTree.children.length;
      break;
    }

    for (let j = 0; j < depth1.children.length; j++) {
      const depth2 = depth1.children[j];
      if (!depth2) continue;

      if (depth2.text === activeId) {
        depth1Index = i;
        depth2Index = j;
        totalDepth1 = headingTree.children.length;
        totalDepth2 = depth1.children.length;
        break;
      }

      for (let k = 0; k < depth2.children.length; k++) {
        const depth3 = depth2.children[k];
        if (!depth3) continue;

        if (depth3.text === activeId) {
          depth1Index = i;
          depth2Index = j;
          depth3Index = k;
          totalDepth1 = headingTree.children.length;
          totalDepth2 = depth1.children.length;
          totalDepth3 = depth2.children.length;
          break;
        }
      }
      if (depth3Index !== -1) break;
    }
    if (depth2Index !== -1 || depth1Index !== -1) break;
  }

  if (depth1Index === -1 || totalDepth1 === 0) return 0;

  // depth1レベルの場合
  // 直前までの%をカウント（その見出しに到達するまでの進捗）
  // 例: depth1が4つなら、インデックス0（1個目）→0%、インデックス1（2個目）→25%
  if (depth2Index === -1) {
    return Math.round((depth1Index * 100) / totalDepth1);
  }

  if (totalDepth2 === 0) return 0;

  // depth2レベルの場合
  // 例: depth1のインデックス1（2個目）で25%、5つのdepth2があると各5%
  // depth2のインデックス2（3個目）→ 25% + 5% * 2 = 35%
  const depth1StartPercentage = (depth1Index * 100) / totalDepth1;
  const depth2PercentagePerItem = 100 / totalDepth1 / totalDepth2;

  if (depth3Index === -1) {
    return Math.round(
      depth1StartPercentage + depth2PercentagePerItem * depth2Index,
    );
  }

  if (totalDepth3 === 0) return 0;

  // depth3レベルの場合
  const depth2StartPercentage =
    depth1StartPercentage + depth2PercentagePerItem * depth2Index;
  const depth3PercentagePerItem = depth2PercentagePerItem / totalDepth3;

  return Math.round(
    depth2StartPercentage + depth3PercentagePerItem * depth3Index,
  );
};
