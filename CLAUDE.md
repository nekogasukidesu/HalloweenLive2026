# CLAUDE.md — このリポジトリで作業するときのルール

SORARU Halloween LIVE 2026 特設サイト（静的HTML）。詳細は README.md を参照。

## 最初にやること

1. `git pull --ff-only origin main` で最新を取り込む。作業中も push 前に必ず pull。
2. README.md の「現在の状態」「触ってはいけない箇所」を読む。

## 現在の状態（重要）

チケット・グッズとも公開済み。**段階公開（時刻による出し分け）は 10/27 に撤去済み**なので、
`data-show` / `data-hide` 属性や `index_0912.html` などはもう存在しない。復活させないこと。

## 壊してはいけないもの

`tools/build_release.py` は `goods/index.html` の次の3行を**文字列として検索**して外している。
並べ替え・整形・コメント文の変更をするとビルドがエラーで止まる。

```
<!-- グッズ情報解禁までは COMING SOON ゲート…
<script>window.GATE_RELEASE_AT = '...';</script>
<script src="../js/gate.js"></script>
```

あわせて `goods/index.html` の `<meta name="robots" content="noindex">` と
`tools/build_release.py` 本体も触らない。変更が必要になったら作業を止めてユーザーに確認する。
HTML 全体の自動整形（フォーマッタ）は絶対にかけない。

## グッズページの編集ルール

- 商品・くじのデータは `goods/index.html` 末尾の `const goods = [...]` と `const kuji = [...]` だけを編集する。HTML 構造は変えない。
- 画像は `goods/img/` に置き、`images:[...]` にパスを書く。**画像ファイルを必ず同じコミットに含める**。
- 価格未定は `price:""`。説明文の改行は `\n`。
- 商品情報の正は商品情報シート（Excel）。シートにない商品を勝手に追加・削除しない。

## CSS を変更したとき

各HTMLの `<link rel="stylesheet" href="…/style.css?v=XXXX">` の番号も変える。
変えないと閲覧者のブラウザが古いCSSを使い続けてレイアウトが崩れる（9/14 に実際に起きた）。

## コミットと push

- 変更は小さく分けて、日本語で「何を変えたか」が分かるメッセージを付ける。
- 競合したら片方を丸ごと採用せず、両方の変更を残して解決する。迷ったらユーザーに見せる。
- `dist/` `.DS_Store` はコミットしない（.gitignore 済み）。

## サーバーへのアップ

- **リポジトリのファイルをそのままサーバーに上げない。** 必ず `python3 tools/build_release.py` で生成した `dist/server/` を上げる。
- 生成後、`dist/server/goods/index.html` に `GATE_RELEASE_AT` が残っていないことを確認する。

## 確認方法

- ローカル: `python3 -m http.server 8765` → http://127.0.0.1:8765/
- `goods/` はローカルだと解禁日時を過ぎているので普通に開ける（端末時計がずれている場合のみパスワード画面）。
