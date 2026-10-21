// 要約の進み具合は概要（overview）から読む。feature をまたぐ読み取りは
// interface 同士でつなぐ（interface/sync.ts の通知の配線と同じ扱い）
export { getSummaryProgress } from '../application/summary-progress';
export type { SummaryProgress } from '../infrastructure/reading-list-repository';
