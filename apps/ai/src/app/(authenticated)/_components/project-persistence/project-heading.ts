type Heading = { projectId: number | null };

export type ProjectHeading = {
  isHeadingTo: (projectId: number | null) => boolean;
  // 返す関数は、そのあとに別の移動が無かったかを返す
  moveTo: (projectId: number | null) => () => boolean;
  // 返す関数は、projectId にいたまま移らなかったかを返す
  stayAt: (projectId: number | null) => () => boolean;
};

// 画面が今いる、または読み込みで向かっているプロジェクト。読み込みや保存を待つあいだに URL で別の
// プロジェクトへ移られることがあり、同じ id へ戻ってきても別の移動として見分けるよう、移るたびに作り直す
export const createProjectHeading = (): ProjectHeading => {
  let current: Heading = { projectId: null };
  return {
    isHeadingTo: (projectId) => current.projectId === projectId,
    moveTo: (projectId) => {
      const heading = { projectId };
      current = heading;
      return () => current === heading;
    },
    stayAt: (projectId) => {
      const heading = current;
      return () => current === heading && heading.projectId === projectId;
    },
  };
};
