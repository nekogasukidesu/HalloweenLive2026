# CLAUDE.md — このリポジトリで作業するときのルール

SORARU Halloween LIVE 2026 特設サイト（静的HTML）。詳細は README.md を参照。
以下は Claude が編集を始める前に必ず守ること。

## 最初にやること

1. `git pull --ff-only origin main` で最新を取り込む。作業中も push 前に必ず pull。
2. 編集前に README.md の「公開スケジュール」「触ってはいけない箇所」を読む。

## 絶対に壊してはいけないもの（段階公開の仕組み）

本番は `tools/build_release.py` が `index.html` から3つのトップページと `.htaccess` を生成して、サーバー時刻で出し分けている。
スクリプトは下記の文字列を**目印として検索**しているので、1文字でも変えると生成が壊れる。

- `index.html`
  - `data-show="ticket"` / `data-hide="ticket"` / `data-show="goods"` 属性と、その要素の `style="display:none"`
  - コメント `<!-- 券売開始前（9/12 18:00 に自動で非表示） -->` `<!-- 券売情報（9/12 18:00 に自動で表示） -->` `<!-- ===== Goods ===== -->`
  - `<section class="section goods" id="goods" data-show="goods" style="display:none">` の開始タグ
- `survey/index.html` `survey/report/index.html`
  - `<li data-show="goods" style="display:none">…GOODS…</li>` のナビ項目
- `goods/index.html` の `<head>` 内
  - `<!-- グッズ情報解禁までは COMING SOON ゲート…` のコメント行
  - `<script>window.GATE_RELEASE_AT = '...';</script>`
  - `<script src="../js/gate.js"></script>`
  - `<meta name="robots" content="noindex">`
- `js/reveal.js` `js/gate.js` の仕組み部分（日時の値だけ変更可）
- `tools/build_release.py`

これらを変更・整形・並べ替えする必要が出たら、作業を止めてユーザーに確認する。
HTML 全体の自動整形（フォーマッタ）は絶対にかけない。

## 解禁日時を変えるとき

3か所を同じ日時にする: `tools/build_release.py` の `SCHEDULE`、`js/reveal.js` の `SCHEDULE`、`goods/index.html` の `window.GATE_RELEASE_AT`。

## グッズページの編集ルール

- 商品・くじのデータは `goods/index.html` 末尾の `const goods = [...]` と `const kuji = [...]` だけを編集する。HTML 構造は変えない。
- 画像は `goods/img/` に置き、`images:[...]` にパスを書く。**画像ファイルを必ず同じコミットに含める**（参照だけ残すとリンク切れ）。
- 価格未定は `price:""`。説明文の改行は `\n`。
- 商品情報の正は商品情報シート（Excel）。シートにない商品を勝手に追加・削除しない。

## コミットと push

- 変更は小さく分けて、日本語で「何を変えたか」が分かるメッセージを付ける。
- 競合したら片方を丸ごと採用せず、両方の変更を残して解決する。迷ったらユーザーに見せる。
- `dist/` `.DS_Store` はコミットしない（.gitignore 済み）。

## サーバーへのアップ

- **リポジトリのファイルをそのままサーバーに上げない。** 必ず `python3 tools/build_release.py` で生成した `dist/server_htaccess/` を上げる。
- 生成前に、解禁前の版（`dist/server_htaccess/index.html`）にグッズや券売の記述が入っていないことを確認する。

## 確認方法

- ローカル: `python3 -m http.server 8765` → http://127.0.0.1:8765/
- 解禁前のグッズページはローカルではパスワード画面になる（パスワードはユーザーに聞く。ファイルに書かない）。
