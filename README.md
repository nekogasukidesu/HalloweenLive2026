# SORARU Halloween LIVE 2026 特設サイト

公開先: https://soraruru.jp/HalloweenLive2026/ （エックスサーバー / Apache .htaccess 使用可）

## 公開スケジュール

| 日時 | 内容 |
|---|---|
| 9/12(土) 18:00 | チケット券売情報（イープラス先着先行）と NEWS 2件（券売開始・新曲3曲）を公開 |
| 9/14(月) 18:00 | グッズ情報解禁。ナビ・トップの GOODS・NEWS が表示され、`goods/` が開放 |

## 本番サーバーへの反映方法（重要）

**リポジトリのファイルをそのままサーバーに上げないこと。** 本番用データは必ず次のコマンドで生成する。

```bash
python3 tools/build_release.py
```

`dist/server_htaccess/`（と同内容の `dist/server_htaccess.zip`）ができる。この中身を `.htaccess` 2つを含めて丸ごと `HalloweenLive2026/` に上書きアップする。

生成される本番用データの仕組み:

- トップページを3ファイルに分割し、ルートの `.htaccess` が **サーバー時刻** で出し分ける
  - `index.html` … 公開前（TICKET は COMING SOON、グッズの記述なし）
  - `index_0912.html` … チケット券売情報あり（券売開始前は直接アクセスしても 404）
  - `index_0914.html` … グッズ情報あり（解禁前は 404）
- `goods/.htaccess` が解禁時刻まで `goods/` 全体を 404 にする（ファイルは先に置いておける）
- 解禁前のファイルにグッズや券売の記述、隠し要素を一切残さない（ソースを見ても分からない）
- `goods/index.html` の JS パスワードゲートは本番用では外す（.htaccess が守るため）

**解禁日時を変えるとき**は `tools/build_release.py` の `SCHEDULE` を書き換えて再生成。あわせて `js/reveal.js` の `SCHEDULE` と `goods/index.html` 先頭の `window.GATE_RELEASE_AT` も同じ日時にする（こちらはローカル/テスト確認用）。

### エックスサーバーの注意

- Xアクセラレータが有効だと HTML が数分キャッシュされ、切り替えが少し遅れることがある。厳密に合わせたい場合はサーバーパネルで一時的にオフにする。
- `.htaccess` は隠しファイル。FTP ソフトで隠しファイル表示をオンにしないと見えない。

## リポジトリ内の時限表示（ローカル・テスト用）

リポジトリの `index.html` は1ファイルのまま、JS（`js/reveal.js`）で表示を切り替える作りになっている。

- `data-show="ticket"` / `data-hide="ticket"` / `data-show="goods"` 属性と `style="display:none"` が付いた要素が切替対象
- `goods/index.html` は `window.GATE_RELEASE_AT` の日時まで JS のパスワードゲート（パスワードは関係者に別途共有）

この JS 方式は「ブラウザ側で隠しているだけ」なので、本番には使わない。上記のビルドで .htaccess 方式に変換される。

## 作業前に必ず

1. **push の前に必ず `git pull`**（GitHub Desktop なら Fetch origin → Pull）。
2. 競合したら **片方を丸ごと採用しない**。両方の変更を残して解決する。
3. 画像を追加したら **画像ファイルも一緒にコミット**する（参照だけ残るとリンク切れになる）。
4. 小さくこまめに push する。

## 触ってはいけない箇所

- `goods/index.html` の `<head>` 内
  - `<script>window.GATE_RELEASE_AT = '...'</script>` と、その直前のコメント行、`gate.js` の読み込み（ビルドがこの3行を探して外す）
  - `<meta name="robots" content="noindex">`
- `index.html` / `survey/**/index.html` の `data-show="..."` `data-hide="..."` 属性、`style="display:none"`、その前後の `<!-- 券売開始前… -->` `<!-- 券売情報… -->` `<!-- ===== Goods ===== -->` コメント（ビルドがこれらを目印にしている）
- `js/gate.js` / `js/reveal.js` の仕組み部分（日時の書き換えだけ OK）
- `tools/build_release.py`

## ファイル構成

```
index.html            トップ（NEWS / GOODS / SCHEDULE / TICKET / NOTICE / PROFILE / MOVIE）
goods/index.html      グッズページ。商品・くじのデータはファイル末尾の JS 配列 goods / kuji
goods/img/            商品画像（WebP、正方形推奨、1枚 200〜300KB 目安）
survey/               衣装アンケート（受付終了）と集計レポート
css/style.css         共通スタイル。グッズページ固有の CSS は goods/index.html 内
js/script.js          ヘッダー・スクロール表示・背景の星
js/reveal.js          時限表示（ローカル/テスト用）
js/gate.js            公開前パスワードゲート（ローカル/テスト用）
assets/               KV・ロゴ・OG画像・アーティスト写真
tools/build_release.py  本番用データ生成
dist/                 生成物（git 管理外）
```

## グッズページの編集

- 商品: `const goods = [...]` に `{ name, price, desc, images, tag }` を追加・編集
- くじ景品: `const kuji = [...]` に `{ rank, top, tag, name, kind, desc, images }`
- `images` の先頭がカードのメイン画像。空配列なら番号のプレースホルダー表示
- 価格未定は `price:""` で「価格は後日発表」表示
- 説明文の改行は `\n`

## ローカル確認

リポジトリのフォルダで `python3 -m http.server 8765` → http://127.0.0.1:8765/
