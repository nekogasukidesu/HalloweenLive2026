/* 時限表示（FamilyMart先行 互換） */
(function () {
  var FM_AT = Date.parse('2026-08-25T18:00:00+09:00');
  function apply() {
    var on = Date.now() >= FM_AT;
    document.querySelectorAll('[data-fm-show]').forEach(function (el) { el.style.display = on ? '' : 'none'; });
    document.querySelectorAll('[data-fm-hide]').forEach(function (el) { el.style.display = on ? 'none' : ''; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
