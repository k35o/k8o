import 'server-only';
// 名前付き Sandbox の配信/停止を preview feature の application 境界として公開する。
// 他 feature（share）は preview/infrastructure を直読みせず、ここを経由して利用する。
export {
  serveSandboxPreview,
  stopSandboxPreview,
} from '../infrastructure/sandbox-preview';
