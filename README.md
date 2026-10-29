# SORARU Halloween LIVE 2026 特設サイト

公開先: https://soraruru.jp/HalloweenLive2026/ （エックスサーバー / Apache .htaccess 使用可）

## 現在の状態

チケット券売（9/12）・グッズ情報解禁（9/14）はいずれも公開済み。**段階公開の仕組みは 10/27 に撤去した**ため、
時刻による出し分けや公開前の隠し要素はもう無い。サーバー上の `index_0912.html` `index_0914.html`
`goods/index_prev.html` も削除済み（`goods/.htaccess` が旧URLをグッズトップへ転送するだけ）。

## 本番サーバーへの反映方法

**リポジトリのファイルをそのままサーバーに上げないこと。** 必ず次のコマンドで生成する。

```bash
python3 tools/build_release.py
```

`dist/server/`（と同内容の `dist/server.zip`）ができる。これを丸ごと `HalloweenLive2026/` に上書きアップする。

スクリプトがやるのは2つだけ:

1. 公開に不要なファイル（`README.md` `CLAUDE.md` `tools/` `dist/` など）を除く
2. `goods/index.html` から公開前パスワードゲートの3行を外す（ローカル確認用にリポジトリ側では残してある）

### エックスサーバーの注意

- Xアクセラレータが有効だと HTML が数分キャッシュされる。すぐ反映したい場合はサーバーパネルでクリアする。
- `.htaccess` は隠しファイル。FTP ソフトで隠しファイル表示をオンにしないと見えない。
- CSS を変更したときは各HTMLの `style.css?v=...` の番号も変える（閲覧者のキャッシュ対策）。

## ページ構成

```
index.html            トップ（NEWS / GOODS / SCHEDULE / TICKET / NOTICE / PROFILE / MOVIE）
goods/index.html      グッズページ。商品・くじのデータはファイル末尾の JS 配列 goods / kuji
goods/img/            商品画像（WebP、正方形推奨、1枚 200〜300KB 目安）
goods/.htaccess       旧版URL（index_prev.html）の転送のみ
tarot/                そらるの星詠みタロット（1枚引き）。index.html / css / js / img
survey/               衣装アンケート（受付終了）と集計レポート
css/style.css         共通スタイル。グッズページ・タロット固有の CSS は各ページ側
js/script.js          ヘッダー・スクロール表示・背景の星
js/reveal.js          FamilyMart先行の表示切替のみ（段階公開の残り）
js/gate.js            公開前パスワードゲート（ローカル確認用。本番ではビルドが外す）
assets/               KV・ロゴ・OG画像・アーティスト写真・レプリカチケット
tools/build_release.py  本番用データ生成
dist/                 生成物（git 管理外）
```

## 作業前に必ず

1. **push の前に必ず `git pull`**（GitHub Desktop なら Fetch origin → Pull）。
2. 競合したら **片方を丸ごと採用しない**。両方の変更を残して解決する。
3. 画像を追加したら **画像ファイルも一緒にコミット**する（参照だけ残るとリンク切れ）。
4. 小さくこまめに push する。

## 触ってはいけない箇所

- `goods/index.html` の `<head>` 内
  - `<!-- グッズ情報解禁までは COMING SOON ゲート…` のコメント行
  - `<script>window.GATE_RELEASE_AT = '...';</script>`
  - `<script src="../js/gate.js"></script>`
    → この3行をビルドが探して外す。並べ替え・整形するとビルドがエラーで止まる
  - `<meta name="robots" content="noindex">`
- `tools/build_release.py`

HTML 全体の自動整形（フォーマッタ）はかけない。

## グッズページの編集

- 商品: `const goods = [...]` に `{ name, price, desc, images, tag }` を追加・編集
- くじ景品: `const kuji = [...]` に `{ rank, top, tag, name, kind, desc, images }`
- `images` の先頭がカードのメイン画像。空配列なら番号のプレースホルダー表示
- 価格未定は `price:""` で「価格は後日発表」表示
- 説明文の改行は `\n`
- 商品情報の正は商品情報シート（Excel）

## ローカル確認

リポジトリのフォルダで `python3 -m http.server 8765` → http://127.0.0.1:8765/
