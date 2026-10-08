// cron ルートとの境界。ルートから infrastructure を直接
// 読まず、この interface 経由でシステム通知の送信を呼ぶ。
export { sendPushNotification } from '../infrastructure/push-notification';
