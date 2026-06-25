import 'server-only';
// 名前付き Sandbox の配信/停止と、studio プレビューへのコード反映を preview feature の
// application 境界として公開する。他 feature（share / projects）は preview/infrastructure を
// 直読みせず、ここを経由して利用する。
export {
  serveSandboxPreview,
  stopSandboxPreview,
} from '../infrastructure/sandbox-preview';
export {
  applyStudioPreviewCode,
  type ApplyPreviewResult,
} from './apply-preview';
