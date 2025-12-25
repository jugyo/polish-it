# Polish It - VSCode Extension Design Document

## 概要

**Polish It** は、LLM 技術を活用して選択したテキストを改善するために設計された VSCode 拡張機能です

## 機能要件

### コア機能

1. **テキスト選択時**: 選択した箇所を LLM で改善し、結果で置き換える
2. **コンテンツタイプ判別**: ファイル全体のコンテキストを解析し、適切な改善を行う
3. **リアルタイム更新**: ストリーミング受信しながらテキストを逐次置き換え

### 対応 LLM プロバイダー

設定で切り替え可能:
- OpenAI API (GPT-4o, GPT-4, GPT-3.5-turbo 等)
- Anthropic API (Claude 3.5 Sonnet, Claude 3 Opus 等)

### 呼び出し方法

- コマンドパレット (`Cmd/Ctrl+Shift+P`)
- 右クリックコンテキストメニュー
- キーボードショートカット (デフォルト: `Cmd/Ctrl+Shift+I`)

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                      VSCode Extension                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Commands   │  │   Editor    │  │   Configuration     │  │
│  │  Handler    │  │   Service   │  │   Manager           │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         └────────────────┼─────────────────────┘             │
│                          │                                   │
│                  ┌───────▼───────┐                          │
│                  │  Improvement  │                          │
│                  │    Engine     │                          │
│                  └───────┬───────┘                          │
│                          │                                   │
│         ┌────────────────┼────────────────┐                 │
│         │                │                │                 │
│  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐        │
│  │   OpenAI    │  │  Anthropic  │  │   Future    │        │
│  │   Client    │  │   Client    │  │  Providers  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## コンポーネント設計

### 1. Commands Handler (`src/commands.ts`)

拡張機能のエントリーポイント。ユーザーアクションを受け取り処理を開始。

```typescript
// 登録するコマンド
- polishIt.polish       // メイン改善コマンド
```

### 2. Editor Service (`src/services/editorService.ts`)

エディタ操作を担当。

責務:
- 選択テキストの取得
- ファイル全体のテキスト取得
- SSE ストリームに応じたテキスト置き換え
- 置き換え中の視覚的フィードバック（ハイライト等）

### 3. Improvement Engine (`src/services/improvementEngine.ts`)

改善ロジックのコア。

責務:
- コンテンツタイプの判別
- 適切なプロンプトの構築
- LLM プロバイダーへのリクエスト
- SSE ストリームの管理

### 4. LLM Clients (`src/clients/`)

各 LLM プロバイダーとの通信を抽象化。

```typescript
interface LLMClient {
  improveText(
    text: string,
    context: ContentContext,
    onChunk: (chunk: string) => void
  ): Promise<void>;
}
```

### 5. Configuration Manager (`src/config.ts`)
f
設定の読み込みと管理。

## コンテンツタイプ判別

ファイルの言語モード、拡張子、内容を解析して適切な改善を行う。

### 判別カテゴリ

| カテゴリ | 検出方法 | 改善の方向性 |
|---------|---------|-------------|
| ソースコード | languageId, 拡張子 | リファクタリング、可読性向上、バグ修正 |
| Markdown | `.md`, languageId | 文章の明確化、構造改善、誤字修正 |
| JSON/YAML | `.json`, `.yaml` | フォーマット、スキーマ準拠 |
| コミットメッセージ | Git context | Conventional Commits 準拠 |
| ドキュメント | `.txt`, `.rst` | 文章改善、明確化 |
| プロンプト | 検出パターン | より効果的なプロンプトへ |

### プロンプト構築例

```typescript
const buildPrompt = (content: string, context: ContentContext): string => {
  const baseInstruction = `You are improving the following ${context.type}.
Only output the improved version, nothing else.
Maintain the original language (if Japanese, respond in Japanese).`;

  const typeSpecificInstruction = getTypeSpecificInstruction(context);

  return `${baseInstruction}\n\n${typeSpecificInstruction}\n\n---\n${content}`;
};
```

## SSE ストリーミング実装

### フロー

```
1. ユーザーがコマンド実行
2. 選択範囲を保存（開始位置・終了位置）
3. LLM にリクエスト送信
4. SSE チャンク受信ごとに:
   a. 現在の置き換え済みテキストに追加
   b. エディタの選択範囲を更新後テキストで置換
   c. カーソル位置を適切に更新
5. 完了後、Undo スタックに1つの操作として記録
```

### エディタ更新戦略

```typescript
class StreamingEditor {
  private originalRange: vscode.Range;
  private accumulatedText: string = '';

  async onChunk(chunk: string): Promise<void> {
    this.accumulatedText += chunk;

    await this.editor.edit(editBuilder => {
      // 元の範囲を現在の累積テキストで置換
      editBuilder.replace(this.currentRange, this.accumulatedText);
    });

    // 範囲を更新
    this.updateCurrentRange();
  }
}
```

## 設定項目

```jsonc
// settings.json
{
  // LLM プロバイダー選択
  "polishIt.provider": "openai" | "anthropic",

  // OpenAI 設定
  "polishIt.openai.apiKey": "sk-...",
  "polishIt.openai.model": "gpt-4o",
  "polishIt.openai.baseUrl": "https://api.openai.com/v1", // カスタムエンドポイント用

  // Anthropic 設定
  "polishIt.anthropic.apiKey": "sk-ant-...",
  "polishIt.anthropic.model": "claude-3-5-sonnet-20241022",

  // 共通設定
  "polishIt.maxTokens": 4096,
  "polishIt.temperature": 0.3
}
```

## UI/UX 設計

### 実行中の表示

1. **ステータスバー**: "Improving..." スピナー表示
2. **エディタ**: 置き換え対象範囲をハイライト
3. **進捗**: 受信チャンク数または文字数を表示

### エラーハンドリング

- API キー未設定 → 設定画面への誘導
- ネットワークエラー → リトライオプション付きエラー通知
- レート制限 → 待機時間を表示

### キャンセル機能

- `Escape` キーで処理をキャンセル
- キャンセル時は元のテキストに復元

## ファイル構成

```
polish-it/
├── src/
│   ├── extension.ts          # エントリーポイント
│   ├── commands.ts           # コマンドハンドラ
│   ├── config.ts             # 設定管理
│   ├── services/
│   │   ├── editorService.ts  # エディタ操作
│   │   ├── improvementEngine.ts # 改善ロジック
│   │   └── contentAnalyzer.ts   # コンテンツ解析
│   ├── clients/
│   │   ├── index.ts          # クライアント共通インターフェース
│   │   ├── openai.ts         # OpenAI クライアント
│   │   └── anthropic.ts      # Anthropic クライアント
│   └── types.ts              # 型定義
├── package.json
├── tsconfig.json
└── README.md
```

## package.json 定義（抜粋）

```json
{
  "name": "polish-it",
  "displayName": "Polish It",
  "description": "Polish selected text using LLM",
  "version": "0.1.0",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "polishIt.polish",
        "title": "Polish"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "command": "polishIt.polish",
          "group": "1_modification"
        }
      ]
    },
    "keybindings": [
      {
        "command": "polishIt.polish",
        "key": "ctrl+shift+i",
        "mac": "cmd+shift+i",
        "when": "editorTextFocus"
      }
    ],
    "configuration": {
      "title": "Polish It",
      "properties": {
        "polishIt.provider": {
          "type": "string",
          "default": "openai",
          "enum": ["openai", "anthropic"],
          "description": "LLM provider to use"
        }
        // ... その他の設定
      }
    }
  }
}
```

## セキュリティ考慮事項

1. **API キーの保護**: VSCode の SecretStorage API の使用を検討
2. **コンテンツの送信**: ユーザーに送信内容を明示
3. **ローカル処理**: 可能な限りローカルで前処理

## 今後の拡張可能性

1. **カスタムプロンプト**: ユーザー定義の改善指示
2. **履歴管理**: 改善前後の diff を保存
3. **バッチ処理**: 複数ファイルの一括改善
4. **ローカル LLM**: Ollama 等のローカル LLM 対応

## 開発マイルストーン

### Phase 1: MVP
- [ ] 基本的なテキスト改善機能
- [ ] OpenAI API 連携
- [ ] コマンドパレットからの実行

### Phase 2: 機能拡充
- [ ] Anthropic API 連携
- [ ] SSE ストリーミング実装
- [ ] コンテキストメニュー・ショートカット

### Phase 3: 品質向上
- [ ] コンテンツタイプ別プロンプト最適化
- [ ] エラーハンドリング強化
- [ ] テスト追加
