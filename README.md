# SORARU Halloween LIVE 2026 特設サイト

公開先: https://soraruru.jp/HalloweenLive2026/

## 公開スケジュール（重要）

| 日時 | 内容 | 仕組み |
|---|---|---|
| 9/12(土) 18:00 | チケット券売情報（イープラス先着先行）を公開 | トップページの時限表示で自動切替 |
| 9/14 12:00（仮） | グッズ情報解禁 | ナビ・トップの GOODS・NEWS が自動表示。`goods/` はそれまでパスワードゲート |

解禁日時を変えるときは **`js/reveal.js` 先頭の `SCHEDULE`** と、**`goods/index.html` 先頭の `window.GATE_RELEASE_AT`** の2か所を同じ日時に書き換える。

> ⚠️ 時限表示は「ブラウザ側で隠しているだけ」です。サーバーに置いたファイルはソースを見れば読めます。
> **解禁前に `goods/` フォルダと `goods/img/` の画像を本番・テストサーバーへアップしないこと。**
> サーバーへのアップ担当と日時は事前に決めてください。

## 作業前に必ず

1. **push の前に必ず `git pull`**（GitHub Desktop なら Fetch origin → Pull）。
2. 競合したら **片方を丸ごと採用しない**。両方の変更を残して解決する。
3. 画像を追加したら **画像ファイルも一緒にコミット**する（参照だけ残るとリンク切れになる）。
4. 小さくこまめに push する。

## 触ってはいけない箇所

- `goods/index.html` の `<head>` 内
  - `<script>window.GATE_RELEASE_AT = '...'</script>` … 解禁前ゲート。消えるとグッズページが公開状態になる
  - `<meta name="robots" content="noindex">` … 検索エンジン除け
- `index.html` / `survey/**/index.html` の `data-show="..."` `data-hide="..."` 属性と、その要素の `style="display:none"`
  - GOODS ナビ、GOODS セクション、NEWS の GOODS・TICKET 項目、TICKET の COMING SOON と券売情報に付いている
- `js/gate.js` / `js/reveal.js` の仕組み部分（日時の書き換えだけOK）

## ファイル構成

```
index.html            トップ（NEWS / GOODS / SCHEDULE / TICKET / NOTICE / PROFILE / MOVIE）
goods/index.html      グッズページ。商品・くじのデータはファイル末尾の JS 配列 goods / kuji
goods/img/            商品画像（WebP、正方形推奨、1枚 200〜300KB 目安）
survey/               衣装アンケート（受付終了）と集計レポート
css/style.css         共通スタイル。グッズページ固有の CSS は goods/index.html 内
js/script.js          ヘッダー・スクロール表示・背景の星
js/reveal.js          時限表示（SCHEDULE を編集）
js/gate.js            公開前パスワードゲート
assets/               KV・ロゴ・OG画像・アーティスト写真
```

## グッズページの編集

- 商品: `const goods = [...]` に `{ name, price, desc, images, tag }` を追加・編集
- くじ景品: `const kuji = [...]` に `{ rank, top, tag, name, kind, desc, images }`
- `images` の先頭がカードのメイン画像。空配列なら番号のプレースホルダー表示
- 価格未定は `price:""` で「価格は後日発表」表示
- 説明文の改行は `\n`

## プレビュー

- 解禁前のグッズページ確認用パスワード: 関係者に別途共有
- ローカル確認: リポジトリのフォルダで `python3 -m http.server 8765` → http://127.0.0.1:8765/

## 本番反映

GitHub Pages ではありません。`.git` `.claude` 以外のファイルをそのままサーバーの `HalloweenLive2026/` に上書きアップします。
