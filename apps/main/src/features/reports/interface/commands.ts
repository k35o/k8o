// Next.js entry（route handler）との境界。route から application を直接読まず
// この interface 経由で reports 作成ユースケースを呼ぶ。
export { createReports } from '../application/report';
