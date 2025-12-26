# Polish It

A VSCode extension that polishes selected text using LLM.

## Features

- **Polish Selection**: Select text and polish it with AI
- **Smart Context Detection**: Automatically detects content type (code, markdown, JSON, etc.) and applies appropriate improvements
- **Real-time Streaming**: See improvements appear in real-time as they're generated

## Installation

### From VSCode Marketplace
Coming soon

### Manual Installation (from .vsix file)

1. Build the extension package:
   ```bash
   npm install
   npm run package
   ```

2. Install the generated `.vsix` file:
   ```bash
   code --install-extension polish-it-0.1.0.vsix
   ```

   Or in VSCode:
   - Open Command Palette (`Cmd+Shift+P`)
   - Run "Extensions: Install from VSIX..."
   - Select the `.vsix` file

## Configuration

Open VSCode Settings and search for "Polish It":

| Setting | Description | Default |
|---------|-------------|---------|
| `polishIt.openai.apiKey` | Your OpenAI API key | `""` |
| `polishIt.openai.model` | Model to use (e.g., `gpt-4o-mini`, `gpt-4o`) | `"gpt-4o-mini"` |
| `polishIt.openai.baseUrl` | API base URL (for custom endpoints) | `"https://api.openai.com/v1"` |

## Usage

### Command Palette
1. Select text
2. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
3. Run "Polish"

### Keyboard Shortcut
- **Mac**: `Cmd+Shift+I`
- **Windows/Linux**: `Ctrl+Shift+I`

### Context Menu
1. Select text
2. Right-click
3. Click "Polish"

## Supported Content Types

The extension automatically detects the content type and optimizes the improvement prompt:

| Content Type | Improvements |
|-------------|--------------|
| Code (JS/TS/Python/etc.) | Refactoring, readability, best practices |
| Markdown | Clarity, structure, grammar |
| JSON/YAML | Formatting, structure |
| Plain Text | Grammar, clarity, conciseness |

## License

MIT
