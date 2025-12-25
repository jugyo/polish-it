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

## Development

### Prerequisites

- Node.js 18+
- VSCode 1.85+

### Setup

```bash
# Clone the repository
git clone https://github.com/jugyo/polish-it.git
cd polish-it

# Install dependencies
npm install

# Compile
npm run compile
```

### Debugging the Extension

1. Open this project in VSCode
2. Press `F5` to launch a new VSCode window with the extension loaded
3. In the new window, open any file and test the extension
4. View debug output in the Debug Console of the original window

#### Debug Steps

1. **Set breakpoints**: Click on the left margin of any `.ts` file in `src/`
2. **Start debugging**: Press `F5` or go to Run > Start Debugging
3. **Test the extension**: In the Extension Development Host window:
   - Open a file
   - Select some text
   - Run the command via `Cmd+Shift+I` or Command Palette
4. **View logs**: Check the Debug Console in the main VSCode window
5. **Hot reload**: After making changes, press `Cmd+Shift+F5` to restart

#### Useful Debug Commands

- `F5` - Start debugging
- `Shift+F5` - Stop debugging
- `Cmd+Shift+F5` - Restart debugging
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into

### Building

```bash
# Compile TypeScript
npm run compile

# Watch mode
npm run watch

# Package as .vsix
npm run package
```

### Project Structure

```
polish-it/
├── src/
│   ├── extension.ts           # Entry point
│   ├── commands.ts            # Command handlers
│   ├── config.ts              # Configuration management
│   ├── clients/
│   │   └── openai.ts          # OpenAI API client
│   └── services/
│       ├── editorService.ts   # Editor operations
│       └── contentAnalyzer.ts # Content type detection
├── package.json
└── tsconfig.json
```

## License

MIT
