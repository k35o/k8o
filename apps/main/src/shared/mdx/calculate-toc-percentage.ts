import type { HeadingTree } from './types';

export const calculateTocPercentage = (
  activeId: string,
  headingTree: HeadingTree,
): number => {
  if (activeId === '') return 0;

  let depth1Index = -1;
  let depth2Index = -1;
  let depth3Index = -1;
  let totalDepth1 = 0;
  let totalDepth2 = 0;
  let totalDepth3 = 0;

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

  if (depth2Index === -1) {
    return Math.round((depth1Index * 100) / totalDepth1);
  }

  if (totalDepth2 === 0) return 0;

  const depth1StartPercentage = (depth1Index * 100) / totalDepth1;
  const depth2PercentagePerItem = 100 / totalDepth1 / totalDepth2;

  if (depth3Index === -1) {
    return Math.round(
      depth1StartPercentage + depth2PercentagePerItem * depth2Index,
    );
  }

  if (totalDepth3 === 0) return 0;

  const depth2StartPercentage =
    depth1StartPercentage + depth2PercentagePerItem * depth2Index;
  const depth3PercentagePerItem = depth2PercentagePerItem / totalDepth3;

  return Math.round(
    depth2StartPercentage + depth3PercentagePerItem * depth3Index,
  );
};
