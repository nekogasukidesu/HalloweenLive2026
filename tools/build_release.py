#!/usr/bin/env python3
"""
本番サーバー用データ（.htaccess 段階公開版）を書き出す

使い方:  python3 tools/build_release.py
出力:    dist/server_htaccess/  と  dist/server_htaccess.zip

リポジトリの index.html から次の3ファイルを生成し、.htaccess でサーバー時刻により出し分ける
  index.html       … 公開前（TICKET は COMING SOON、グッズの記述なし）
  index_0912.html  … チケット券売情報を表示
  index_0914.html  … グッズ情報も表示
goods/ は goods/.htaccess で解禁時刻まで 404。goods/index.html の JS ゲート行は本番用では外す。
解禁日時を変えるときは下の SCHEDULE を書き換える（js/reveal.js / goods/index.html の日時も揃えること）
"""
import re, shutil, subprocess, pathlib, sys

SCHEDULE = {
    'ticket': '20260912180000',   # チケット券売開始（YYYYMMDDHHMMSS, 日本時間）
    'goods':  '20260914180000',   # グッズ情報解禁
}
BASE_PATH = '/HalloweenLive2026/'   # サーバー上の設置パス

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist' / 'server_htaccess'
EXCLUDE_NAMES = {'.DS_Store', '.gitignore', '.gitkeep', 'README.md'}

def source_files():
    out = []
    for p in ROOT.rglob('*'):
        if not p.is_file(): continue
        rel = p.relative_to(ROOT)
        parts = rel.parts
        if parts[0] in ('.git', '.claude', 'dist', 'tools'): continue
        if p.name in EXCLUDE_NAMES or p.name.startswith('._'): continue
        out.append(rel)
    return sorted(out)

def strip_goods(h):
    h = re.sub(r'\n\s*<li data-show="goods" style="display:none"><a href="[^"]*" class="nav__link">GOODS</a></li>', '', h)
    h = re.sub(r'\n\s*<li class="news__item" data-show="goods" style="display:none">.*?</li>', '', h, flags=re.S)
    h = re.sub(r'\n<!-- ===== Goods ===== -->\n<section class="section goods" id="goods" data-show="goods" style="display:none">.*?</section>\n', '\n', h, flags=re.S)
    return h

def goods_static(h):
    h = h.replace('<li data-show="goods" style="display:none">', '<li>')
    h = h.replace('<li class="news__item" data-show="goods" style="display:none">', '<li class="news__item">')
    h = h.replace('<section class="section goods" id="goods" data-show="goods" style="display:none">', '<section class="section goods" id="goods">')
    return h

def strip_ticket_live(h):
    h = re.sub(r'\n\s*<!-- 券売情報（9/12 18:00 に自動で表示） -->\n\s*<div data-show="ticket" style="display:none">.*?\n    </div>\n', '\n', h, flags=re.S)
    h = re.sub(r'\n\s*<li class="news__item" data-show="ticket" style="display:none">.*?</li>', '', h, flags=re.S)
    h = h.replace('<div class="goods__soon" data-hide="ticket">', '<div class="goods__soon">')
    h = h.replace('    <!-- 券売開始前（9/12 18:00 に自動で非表示） -->\n', '')
    return h

def ticket_static(h):
    h = re.sub(r'\n\s*<!-- 券売開始前（9/12 18:00 に自動で非表示） -->\n\s*<div class="goods__soon" data-hide="ticket">.*?</div>\n', '\n', h, flags=re.S)
    h = h.replace('<div data-show="ticket" style="display:none">', '<div>')
    h = h.replace('<li class="news__item" data-show="ticket" style="display:none">', '<li class="news__item">')
    h = h.replace('    <!-- 券売情報（9/12 18:00 に自動で表示） -->\n', '')
    return h

def main():
    if DIST.exists(): shutil.rmtree(DIST)
    for rel in source_files():
        if str(rel) == 'index.html': continue
        d = DIST / rel; d.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / rel, d)

    src = (ROOT / 'index.html').read_text(encoding='utf-8')
    (DIST / 'index.html').write_text(strip_ticket_live(strip_goods(src)), encoding='utf-8')
    (DIST / 'index_0912.html').write_text(ticket_static(strip_goods(src)), encoding='utf-8')
    (DIST / 'index_0914.html').write_text(goods_static(ticket_static(src)), encoding='utf-8')

    # アンケート系ページ: 隠し GOODS ナビを削除（痕跡を残さない）
    for rel in ('survey/index.html', 'survey/report/index.html'):
        p = DIST / rel
        if p.exists():
            p.write_text(re.sub(r'\n\s*<li data-show="goods" style="display:none"><a href="[^"]*" class="nav__link">GOODS</a></li>', '', p.read_text(encoding='utf-8')), encoding='utf-8')

    # reveal.js: 予定日時・ラベルを含まない互換版に置き換え
    (DIST / 'js' / 'reveal.js').write_text('''/* 時限表示（FamilyMart先行 互換） */
(function () {
  var FM_AT = Date.parse('2026-08-25T18:00:00+09:00');
  function apply() {
    var on = Date.now() >= FM_AT;
    document.querySelectorAll('[data-fm-show]').forEach(function (el) { el.style.display = on ? '' : 'none'; });
    document.querySelectorAll('[data-fm-hide]').forEach(function (el) { el.style.display = on ? 'none' : ''; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
})();
''', encoding='utf-8')

    # goods/index.html: JS ゲート行を外す（.htaccess が守る）
    gp = DIST / 'goods' / 'index.html'
    g = gp.read_text(encoding='utf-8')
    g = re.sub(r'<!-- グッズ情報解禁までは COMING SOON ゲート[^\n]*\n<script>window\.GATE_RELEASE_AT = \'[^\']+\';</script>\n<script src="\.\./js/gate\.js"></script>', '<!-- 解禁前の非公開は goods/.htaccess で制御 -->', g)
    gp.write_text(g, encoding='utf-8')

    t, gd = SCHEDULE['ticket'], SCHEDULE['goods']
    def before(ts):
        # 1秒前の YYYYMMDDHHMMSS（>= 比較の代わりに > で使う）
        import datetime
        d = datetime.datetime.strptime(ts, '%Y%m%d%H%M%S') - datetime.timedelta(seconds=1)
        return d.strftime('%Y%m%d%H%M%S')
    (DIST / '.htaccess').write_text(f'''# ============================================
# 段階公開（サーバー時刻＝日本時間で判定）
#   〜 チケット券売開始   index.html      … 公開前（TICKET は COMING SOON）
#   券売開始 〜           index_0912.html … チケット券売情報を公開
#   グッズ解禁 〜         index_0914.html … グッズ情報を公開（goods/ も同時刻に開放）
# 日時を変えるときは tools/build_release.py の SCHEDULE を書き換えて再生成
# ============================================
RewriteEngine On
RewriteBase {BASE_PATH}

RewriteCond %{{TIME}} >{before(gd)}
RewriteRule ^(index\\.html)?$ index_0914.html [L]
RewriteCond %{{TIME}} >{before(t)}
RewriteRule ^(index\\.html)?$ index_0912.html [L]

RewriteCond %{{TIME}} <{t}
RewriteRule ^index_0912\\.html$ - [R=404,L]
RewriteCond %{{TIME}} <{gd}
RewriteRule ^index_0914\\.html$ - [R=404,L]
''', encoding='utf-8')
    (DIST / 'goods' / '.htaccess').write_text(f'''# グッズ情報解禁までフォルダ全体を 404 にする（日時はルートの .htaccess と揃える）
RewriteEngine On
RewriteCond %{{TIME}} <{gd}
RewriteRule ^ - [R=404,L]
''', encoding='utf-8')

    zpath = DIST.parent / 'server_htaccess.zip'
    zpath.unlink(missing_ok=True)
    subprocess.run(['zip', '-q', '-X', '-r', str(zpath), '.'], cwd=DIST, check=True)
    n = sum(1 for p in DIST.rglob('*') if p.is_file())
    print(f'OK: {n} files -> {zpath}')

if __name__ == '__main__':
    main()
