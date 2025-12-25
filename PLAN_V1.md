# Make It Better v1 実装計画

## スコープ

OpenAI API を使用したシンプルな実装。

### 含まれる機能
- ✅ テキスト選択時の改善
- ✅ 未選択時のファイル全体改善
- ✅ SSE ストリーミングによるリアルタイム更新
- ✅ コンテンツタイプ判別（言語モードベース）
- ✅ コマンドパレット / 右クリック / ショートカット

### 含まれない機能（v2 以降）
- ❌ Anthropic API 対応
- ❌ カスタムプロンプト
- ❌ 履歴管理

---

## 実装タスク

### 1. プロジェクトセットアップ
- `yo code` で VSCode Extension プロジェクト生成
- 必要な依存関係追加（`openai`）

### 2. 設定定義 (`package.json`)
```json
{
  "makeItBetter.openai.apiKey": "",
  "makeItBetter.openai.model": "gpt-4o",
  "makeItBetter.openai.baseUrl": "https://api.openai.com/v1"
}
```

### 3. コマンド登録 (`package.json`)
- `makeItBetter.improve` コマンド
- コンテキストメニュー追加
- キーボードショートカット (`Cmd+Shift+I`)

### 4. OpenAI クライアント (`src/clients/openai.ts`)
- ストリーミング対応の API 呼び出し
- エラーハンドリング

### 5. コンテンツ解析 (`src/services/contentAnalyzer.ts`)
- `languageId` からコンテンツタイプ判別
- タイプ別プロンプト生成

### 6. エディタサービス (`src/services/editorService.ts`)
- 選択範囲 / ファイル全体のテキスト取得
- ストリーミング中のテキスト置換
- キャンセル処理

### 7. メインロジック (`src/extension.ts`, `src/commands.ts`)
- コマンド登録
- 処理フロー制御

---

## ファイル構成

```
make-it-better/
├── src/
│   ├── extension.ts           # activate/deactivate
│   ├── commands.ts            # コマンドハンドラ
│   ├── config.ts              # 設定読み込み
│   ├── clients/
│   │   └── openai.ts          # OpenAI API クライアント
│   └── services/
│       ├── editorService.ts   # エディタ操作
│       └── contentAnalyzer.ts # コンテンツ解析
├── package.json
├── tsconfig.json
└── README.md
```

---

## コンテンツタイプ別プロンプト

| languageId | 改善指示 |
|------------|---------|
| `javascript`, `typescript` 等 | コード品質向上、可読性改善 |
| `markdown` | 文章の明確化、構造改善 |
| `json`, `jsonc` | フォーマット整形、構造改善 |
| `yaml` | フォーマット整形 |
| `plaintext` | 文章改善、誤字修正 |
| その他 | 汎用的な改善 |

---

## 実装順序

```
1. プロジェクト初期化・基本構造作成
   ↓
2. 設定・コマンド定義 (package.json)
   ↓
3. OpenAI クライアント実装
   ↓
4. コンテンツ解析・プロンプト生成
   ↓
5. エディタサービス（ストリーミング置換）
   ↓
6. コマンドハンドラ（全体統合）
   ↓
7. 動作確認・調整
```
