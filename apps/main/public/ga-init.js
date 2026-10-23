window.dataLayer = window.dataLayer || [];
// gtag.js は arguments のオブジェクトで積まれたものを gtag のコマンドとして読むので、rest 引数の配列にしない
function gtag() {
  window.dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', document.currentScript.dataset.gaId);
