# my-feed-hub

技術情報を自動収集して GitHub Pages で一覧表示するツールです。

## １．機能概要

- RSS フィードから技術記事を自動収集
- GitHub Pages での記事一覧表示
- 90 日間のデータ保持（古いデータは自動削除）
- （オプション）Discord Hook 機能を使って Discord チャンネルに投稿することも可能です

## ２．セットアップ

### ■ GitHub Pages の有効化

GitHub リポジトリの Settings > Pages で以下を設定します：

- Source: GitHub Actions

### ■ 環境変数の設定（オプション）

Discord に通知させる場合は、GitHub リポジトリの **Settings > Secrets and variables > Actions** で新しいシークレットを追加します。

- Name: `DISCORD_WEBHOOK_AWS`
- Secret: Discord Webhook URL

`.github/workflows/collect.yml` 上で シークレットを参照できるようにします。

```yaml
env:
  DISCORD_WEBHOOK_AWS: ${{ secrets.DISCORD_WEBHOOK_AWS }}
  DISCORD_WEBHOOK_TECH_GENERAL: ${{ secrets.DISCORD_WEBHOOK_TECH_GENERAL }}
```

### ■ カテゴリの設定

`categories.json` でカテゴリと RSS フィードを管理します。

```json
{
  "categories": [
    {
      "name": "一般",
      "id": "tech_general",
      "feedUrl": "https://www.publickey1.jp/atom.xml",
      "webhookEnvKey": "DISCORD_WEBHOOK_TECH_GENERAL"
    },
    {
      "name": "AWS",
      "id": "aws",
      "feedUrl": "https://aws.amazon.com/jp/about-aws/whats-new/recent/feed/",
      "webhookEnvKey": "DISCORD_WEBHOOK_AWS"
    }
  ]
}
```

**各項目の説明:**

- `name`: 表示用のカテゴリ名
- `id`: カテゴリの識別子（英数字とアンダースコアのみ、データファイル名に使用される）
- `feedUrl`: RSS フィードの URL
- `webhookEnvKey`: Discord Webhook 用環境変数の名前（オプション）

## ３．ローカル環境下での動作確認

### ■ 依存関係のインストール

```bash
npm install
```

### ■ 技術情報の収集と投稿

ローカルで実行して動作確認する場合は下記コマンドを実行します  
`data`配下に収集結果が格納されます

```bash
npm start
```

### ■ WEB ページのローカルプレビュー

収集した技術情報をブラウザで確認する場合は、ローカルサーバーを起動します。

```bash
npm run preview
```

ブラウザで `http://localhost:3000` を開くと、GitHub Pages と同じページが表示されます。

**注意:** 直接 `docs/index.html` をブラウザで開くと CORS エラーが発生するため、必ずローカルサーバーを使用してください。

## ４．その他

### ■ 実行間隔の変更

`.github/workflows/collect.yml` の `cron` 設定を変更します。

```yaml
schedule:
  - cron: "0 */3 * * *" # 3時間毎
```

### ■ データ保持期間の変更

`src/dataManager.js` の定数を変更します。

```javascript
const RETENTION_DAYS = 90; // 日数を変更
```

### ■ Discord 投稿のカスタマイズ

`src/discordPoster.js` の `postToDiscord` 関数内の embed オブジェクトを編集します。

### ■ 初回実行時の挙動

初回実行時の投稿数を変更する場合は `src\index.js` の定数を変更します。

```javascript
const FILTER_DAYS = 15; // 初回実行時に遡る日数
```
