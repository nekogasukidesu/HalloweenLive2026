/* ============================================
   REPORTページ専用ゲート（関係者限定・常時パスワード）
   - 本体サイトの gate.js と違い、自動公開はしない
   - パスワード変更: printf '新パスワード' | shasum -a 256 の結果を PASS_HASH に設定
   - 現在のパスワード: sorastaff1031
   ※ クライアント側の簡易ガードです。確実に秘匿したい場合は
     ホスティング側の Basic認証等を併用してください。
============================================ */
(function () {
  var PASS_HASH = 'b59fdcfffee4cf07e7d6d0847d69431ebc1ae8b0a255f0fd0de67c90a438496f';
  var STORE_KEY = 'report_gate_ok';

  try { if (sessionStorage.getItem(STORE_KEY) === '1') return; } catch (e) {}

  document.documentElement.style.visibility = 'hidden';

  function sha256(str) {
    var buf = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256', buf).then(function (h) {
      return Array.prototype.map.call(new Uint8Array(h), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    });
  }

  function build() {
    var css = document.createElement('style');
    css.textContent =
      '#rgate{position:fixed;inset:0;z-index:99999;background:#07060d;color:#f4f1ff;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'gap:1.2rem;text-align:center;padding:1.5rem;visibility:visible;' +
      "font-family:'Noto Sans JP',sans-serif}" +
      "#rgate .g-sub{font-family:'Cinzel',serif;letter-spacing:.3em;font-size:.78rem;opacity:.85}" +
      '#rgate .g-title{font-size:1.3rem;letter-spacing:.2em;font-weight:700;color:#e9b35a}' +
      '#rgate form{display:flex;gap:.5rem;margin-top:1rem}' +
      '#rgate input{padding:.7rem 1rem;border-radius:999px;border:1px solid rgba(180,170,210,.35);' +
      'background:#14121f;color:#f4f1ff;font-size:16px;width:200px;outline:none}' +
      '#rgate button{padding:.7rem 1.4rem;border-radius:999px;border:0;background:#e9b35a;' +
      'color:#1a0f08;font-weight:700;cursor:pointer}' +
      '#rgate .g-err{font-size:.78rem;color:#ff8a4c;min-height:1.2em}';
    document.head.appendChild(css);

    var gate = document.createElement('div');
    gate.id = 'rgate';
    gate.innerHTML =
      '<p class="g-sub">STAFF ONLY</p>' +
      '<p class="g-title">REPORT PREVIEW</p>' +
      '<form id="rgateForm" autocomplete="off">' +
      '<input type="password" id="rgatePass" placeholder="Password" aria-label="パスワード">' +
      '<button type="submit">ENTER</button></form>' +
      '<p class="g-err" id="rgateErr"></p>';
    document.body.appendChild(gate);
    document.documentElement.style.visibility = '';
    document.body.style.overflow = 'hidden';

    document.getElementById('rgateForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = document.getElementById('rgatePass').value;
      sha256(v).then(function (h) {
        if (h === PASS_HASH) {
          try { sessionStorage.setItem(STORE_KEY, '1'); } catch (e) {}
          document.body.style.overflow = '';
          gate.remove();
        } else {
          document.getElementById('rgateErr').textContent = 'パスワードが違います';
          document.getElementById('rgatePass').value = '';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
