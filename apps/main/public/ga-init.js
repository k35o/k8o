window.dataLayer = window.dataLayer || [];
// gtag.js は arguments のオブジェクトで積まれたものを gtag のコマンドとして読むので、rest 引数の配列にしない
function gtag() {
  window.dataLayer.push(arguments);
}
(function () {
  var script = document.currentScript;
  gtag('js', new Date());
  gtag('config', script.dataset.gaId);

  // data-count-navigations は、拡張計測の「ブラウザの履歴イベントに基づくページの変更」を切ったページに付ける（切らないと戻る・進むを popstate と二重に数える）
  if (script.dataset.countNavigations === undefined || !window.navigation) {
    return;
  }
  var previous = window.location.href;
  window.navigation.addEventListener('navigatesuccess', function () {
    var current = window.location.href;
    if (new URL(current).pathname !== new URL(previous).pathname) {
      gtag('event', 'page_view', {
        page_location: current,
        page_referrer: previous,
        page_title: document.title,
      });
    }
    previous = current;
  });
})();
