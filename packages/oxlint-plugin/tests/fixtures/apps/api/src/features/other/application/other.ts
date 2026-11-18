export const loadDemos = async (): Promise<unknown> => {
  const { listDemos } = await import('../../demo/application/list-demos');
  const { findDemos } = await import('../../demo/infrastructure/demo-repository');
  return [listDemos, findDemos];
};
