#!/usr/bin/env python3
"""
本番サーバー用データを書き出す

使い方:  python3 tools/build_release.py
出力:    dist/server/  と  dist/server.zip

段階公開（チケット 9/12・グッズ 9/14）は完了したため、時刻による出し分けは行わない。
このスクリプトがやるのは次の2つだけ:
  1. 公開に不要なファイル（README.md / CLAUDE.md / tools/ / dist/ など）を除く
  2. goods/index.html から公開前パスワードゲートの3行を外す
       <!-- グッズ情報解禁までは COMING SOON ゲート… -->
       <script>window.GATE_RELEASE_AT = '...';</script>
       <script src="../js/gate.js"></script>
     （ローカル確認用にリポジトリ側では残してある）
出力をそのまま HalloweenLive2026/ に上書きアップする。
"""
import re, shutil, subprocess, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist' / 'server'
EXCLUDE_DIRS = {'.git', '.claude', 'dist', 'tools'}
EXCLUDE_NAMES = {'.DS_Store', '.gitignore', '.gitkeep', 'README.md', 'CLAUDE.md'}

GATE_RE = re.compile(
    r'<!-- グッズ情報解禁までは COMING SOON ゲート[^\n]*\n'
    r'<script>window\.GATE_RELEASE_AT = \'[^\']+\';</script>\n'
    r'<script src="\.\./js/gate\.js"></script>'
)

def source_files():
    out = []
    for p in ROOT.rglob('*'):
        if not p.is_file():
            continue
        rel = p.relative_to(ROOT)
        if rel.parts[0] in EXCLUDE_DIRS:
            continue
        if p.name in EXCLUDE_NAMES or p.name.startswith('._'):
            continue
        out.append(rel)
    return sorted(out)

def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    for rel in source_files():
        dst = DIST / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ROOT / rel, dst)

    # グッズページの公開前ゲートを外す
    gp = DIST / 'goods' / 'index.html'
    if gp.exists():
        g = gp.read_text(encoding='utf-8')
        g2 = GATE_RE.sub('<!-- 公開前ゲートはビルド時に除去 -->', g)
        if g2 == g and 'GATE_RELEASE_AT' in g:
            raise SystemExit('ERROR: goods/index.html のゲート3行が見つからず除去できませんでした。'
                             'CLAUDE.md の「触ってはいけない箇所」を確認してください。')
        gp.write_text(g2, encoding='utf-8')

    zpath = DIST.parent / 'server.zip'
    zpath.unlink(missing_ok=True)
    subprocess.run(['zip', '-q', '-X', '-r', str(zpath), '.'], cwd=DIST, check=True)
    n = sum(1 for p in DIST.rglob('*') if p.is_file())
    print(f'OK: {n} files -> {zpath}')

if __name__ == '__main__':
    main()
