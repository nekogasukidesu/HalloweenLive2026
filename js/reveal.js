/* ============================================
   時限公開（スケジュール表示切替）
   - 下の SCHEDULE に「名前: 解禁日時」を書く
   - HTML側で data-show="名前" を付けた要素は解禁後に表示、
     data-hide="名前" を付けた要素は解禁後に非表示になる
   - 解禁前に表示したくない要素には style="display:none" も付けておく
     （JS が動くまでの一瞬の表示を防ぐため）
   - ページを開いたままでも時刻を過ぎれば自動で切り替わる
   ※ 判定は閲覧者の端末時計に依存します。確実に切り替えたい場合は
     解禁後に「data-show / data-hide を外したデータ」を再アップしてください。
============================================ */
(function () {
  var SCHEDULE = {
    fm:     '2026-08-25T18:00:00+09:00',   // FamilyMart先行（終了済み）
    ticket: '2026-09-12T18:00:00+09:00',   // イープラス先着先行 受付開始
    goods:  '2026-09-14T12:00:00+09:00'    // ★グッズ情報解禁（要確認）
  };

  var AT = {};
  for (var k in SCHEDULE) AT[k] = Date.parse(SCHEDULE[k]);

  function apply() {
    var now = Date.now(), pending = false;
    for (var key in AT) {
      var on = now >= AT[key];
      if (!on) pending = true;
      document.querySelectorAll('[data-show="' + key + '"]').forEach(function (el) {
        el.style.display = on ? '' : 'none';
      });
      document.querySelectorAll('[data-hide="' + key + '"]').forEach(function (el) {
        el.style.display = on ? 'none' : '';
      });
    }
    // 旧属性（FamilyMart先行）との互換
    var fmOn = now >= AT.fm;
    document.querySelectorAll('[data-fm-show]').forEach(function (el) { el.style.display = fmOn ? '' : 'none'; });
    document.querySelectorAll('[data-fm-hide]').forEach(function (el) { el.style.display = fmOn ? 'none' : ''; });
    return pending;
  }

  function run() {
    if (apply()) {
      var timer = setInterval(function () { if (!apply()) clearInterval(timer); }, 1000);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
