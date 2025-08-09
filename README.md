# PochiPochi Composer

SRSに基づくMVP実装です。子どもが選んだタグから音楽属性を決定し、安全なミックスとスケール補正を行うユーティリティを提供します。

## 概要

- `mapTagsToAttributes(tags, tempo?, key?)`
  - 最大3つのタグ（例: `ねこ`, `ねむい`, `だいぼうけん`）をBPM・楽器・ドラムパターン・ミックス設定に変換します。
- `enforceKidSafeMix(mix)`
  - 高域ブーストやラウドネスを子ども向けに制限します。
- `quantizeAndClamp(melody, key, scale)`
  - メロディを量子化し、スケール外音を最近傍音に吸着させます。

## デモ

`npm start` でブラウザ向け簡易デモを起動できます。

## ディレクトリ構成

- `src/prompt-mapper.js` – ユーティリティ本体
- `public/` – Webインターフェース
- `server.js` – 簡易HTTPサーバー
- `test/prompt-mapper.test.js` – Node.jsテスト
- `SRS.md` – ソフトウェア要求仕様書
- `LICENSE`

## 開発

1. Node.js 18 以降を用意します。
2. リポジトリをクローンし依存をインストール: `npm install`
3. テスト実行: `npm test`
4. Webインターフェース起動: `npm start` → `http://localhost:3000` をブラウザで開く

## ライセンス

ISC
