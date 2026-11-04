window.dataLayer = window.dataLayer || [];
// gtag.js は arguments のオブジェクトで積まれたものを gtag のコマンドとして読むので、rest 引数の配列にしない
function gtag() {
  window.dataLayer.push(arguments);
}
(function () {
  var script = document.currentScript;
  gtag('js', new Date());
  // gtag.js は load の後に読むので、config に数えさせると、それまでに遷移した先の URL と題で数えてしまう
  gtag('config', script.dataset.gaId, {
    cookie_flags: 'secure;samesite=lax',
    send_page_view: false,
  });
  gtag('event', 'page_view', {
    page_location: window.location.href,
    page_title: document.title,
  });

  // HTML に async で書くと、gtag.js が CSS やフォントと帯域を取り合って FCP を遅らせるので、load の後に足す。
  // src を JS で入れると Trusted Types の sink になるので、HTML に type で止めて書いた script を写し、type を外す
  function loadGtag() {
    var gtagScript = document.getElementById('gtag-js').cloneNode();
    gtagScript.removeAttribute('id');
    gtagScript.removeAttribute('type');
    document.head.appendChild(gtagScript);
  }
  if (document.readyState === 'complete') {
    loadGtag();
  } else {
    window.addEventListener('load', loadGtag, { once: true });
  }

  // 拡張計測の「ブラウザの履歴イベントに基づくページの変更」を切ってある前提で送る（切らないと戻る・進むを popstate と二重に数える）
  if (!window.navigation) {
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
