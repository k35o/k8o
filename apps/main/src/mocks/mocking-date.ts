// Storybookの全Storyに適用するモック基準時刻（storybook-addon-mock-date）。
// Storyのモックデータを現在時刻から相対生成する場合は、Date.now() ではなく
// この定数を基準にすること。decoratorによる時刻モックはrender時にしか効かず、
// モジュールスコープの Date.now() は実時刻を返すため
export const MOCKING_DATE = new Date(2023, 0, 2, 12, 34, 56);
