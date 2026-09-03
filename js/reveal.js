/* ============================================
   時限公開（FamilyMart先行受付）
   - FM_AT を過ぎると data-fm-show の要素を表示し、
     data-fm-hide の要素を非表示にする
   - ページを開いたままでも時刻を過ぎれば自動で切り替わる
============================================ */
(function () {
  var FM_AT = Date.parse('2026-08-25T18:00:00+09:00');

  function apply() {
    var on = Date.now() >= FM_AT;
    document.querySelectorAll('[data-fm-show]').forEach(function (el) {
      el.style.display = on ? '' : 'none';
    });
    document.querySelectorAll('[data-fm-hide]').forEach(function (el) {
      el.style.display = on ? 'none' : '';
    });
    return on;
  }

  if (!apply()) {
    var timer = setInterval(function () {
      if (apply()) clearInterval(timer);
    }, 1000);
  }
})();
