/* ============================================
   公開前ゲート（パスワード + 公開タイマー）
   - RELEASE_AT を過ぎると自動で全公開
   - それまでは COMING SOON 画面（パスワードでプレビュー可）
   - パスワード変更: 新パスワードの SHA-256 を PASS_HASH に設定
     （ターミナル: printf '新パスワード' | shasum -a 256）
   ※ クライアント側での簡易ガードです。確実に秘匿したい場合は
     ホスティング側の Basic認証等を併用してください。
============================================ */
(function () {
  var RELEASE_AT = Date.parse('2026-07-22T19:00:00+09:00');
  var PASS_HASH = 'f283ec70734eab088ad35a7066e5d40a6d236c0f7f13fb66f28548c2c88ac1e6'; // soraru2026

  if (Date.now() >= RELEASE_AT) return;
  try { if (sessionStorage.getItem('gate_ok') === '1') return; } catch (e) {}

  // ページ内容を隠す
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
      '#gate{position:fixed;inset:0;z-index:99999;background:#07060d;color:#f4f1ff;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'gap:1.2rem;text-align:center;padding:1.5rem;visibility:visible;' +
      "font-family:'Noto Sans JP',sans-serif}" +
      "#gate .g-sub{font-family:'Cinzel',serif;letter-spacing:.3em;font-size:.78rem;opacity:.85}" +
      '#gate .g-title{font-size:1.5rem;letter-spacing:.2em;font-weight:700;color:#e9b35a}' +
      '#gate form{display:flex;gap:.5rem;margin-top:1rem}' +
      '#gate input{padding:.7rem 1rem;border-radius:999px;border:1px solid rgba(180,170,210,.35);' +
      'background:#14121f;color:#f4f1ff;font-size:16px;width:200px;outline:none}' +
      '#gate button{padding:.7rem 1.4rem;border-radius:999px;border:0;background:#e9b35a;' +
      'color:#1a0f08;font-weight:700;cursor:pointer}' +
      '#gate .g-err{font-size:.78rem;color:#ff8a4c;min-height:1.2em}';
    document.head.appendChild(css);

    var gate = document.createElement('div');
    gate.id = 'gate';
    gate.innerHTML =
      '<p class="g-title">COMING SOON</p>' +
      '<form id="gateForm" autocomplete="off">' +
      '<input type="password" id="gatePass" placeholder="Password" aria-label="パスワード">' +
      '<button type="submit">ENTER</button></form>' +
      '<p class="g-err" id="gateErr"></p>';
    document.body.appendChild(gate);
    document.documentElement.style.visibility = '';
    document.body.style.overflow = 'hidden';

    // 解禁時刻を過ぎたら自動で公開
    var timer = setInterval(function () {
      if (Date.now() >= RELEASE_AT) { clearInterval(timer); unlock(); }
    }, 1000);

    function unlock() {
      try { sessionStorage.setItem('gate_ok', '1'); } catch (e) {}
      document.body.style.overflow = '';
      gate.remove();
    }

    document.getElementById('gateForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = document.getElementById('gatePass').value;
      sha256(v).then(function (h) {
        if (h === PASS_HASH) { unlock(); }
        else {
          document.getElementById('gateErr').textContent = 'パスワードが違います';
          document.getElementById('gatePass').value = '';
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
