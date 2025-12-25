import * as vscode from 'vscode';
import { OpenAIClient } from './clients/openai';
import { buildSystemPrompt } from './services/contentAnalyzer';
import { getEditorContext, StreamingEditor } from './services/editorService';

// Output channel for logging
let outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('Make It Better');
  }
  return outputChannel;
}

function log(message: string): void {
  const channel = getOutputChannel();
  const timestamp = new Date().toISOString();
  channel.appendLine(`[${timestamp}] ${message}`);
}

export async function improveCommand(): Promise<void> {
  const context = getEditorContext();
  if (!context) {
    vscode.window.showErrorMessage('No active editor found.');
    return;
  }

  const { editor, document, selections, fullFileContent, hasSelection } = context;

  // Check if all selections are empty
  const hasContent = selections.some(sel => sel.originalText.trim());
  if (!hasContent) {
    vscode.window.showWarningMessage('No content to improve.');
    return;
  }

  const systemPrompt = buildSystemPrompt(fullFileContent);

  log('=== SYSTEM PROMPT ===');
  log(systemPrompt);
  log(`=== Processing ${selections.length} selection(s) ===`);

  // Create abort controller for cancellation
  const abortController = new AbortController();

  // Show progress
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: hasSelection
        ? `Improving ${selections.length} selection(s)...`
        : `Improving ${selections.length} line(s)...`,
      cancellable: true,
    },
    async (_progress, token) => {
      // Handle cancellation
      token.onCancellationRequested(() => {
        abortController.abort();
      });

      // Process selections from top to bottom
      for (let i = 0; i < selections.length; i++) {
        if (abortController.signal.aborted) {
          break;
        }

        const { structure } = selections[i];

        // Get current selection (auto-updated by VSCode after edits)
        const currentSelections = editor.selections;
        const currentSelection = currentSelections[i];
        if (!currentSelection) {
          continue;
        }

        const targetRange = !currentSelection.isEmpty
          ? new vscode.Range(currentSelection.start, currentSelection.end)
          : document.lineAt(currentSelection.active.line).range;

        const currentText = document.getText(targetRange);

        // Skip empty selections
        if (!currentText.trim()) {
          continue;
        }

        log(`=== Selection ${i + 1}/${selections.length} ===`);
        log(`Target range: (${targetRange.start.line}:${targetRange.start.character}) - (${targetRange.end.line}:${targetRange.end.character})`);
        log(`Content: ${JSON.stringify(structure.content)}`);

        try {
          const client = new OpenAIClient();
          const streamingEditor = new StreamingEditor(editor, targetRange, structure);

          // Build user message with structure hint
          const lines = structure.content.split('\n');
          const lineCount = lines.length;
          const userMessage = lineCount > 1
            ? `Improve the following text. The improved text MUST have exactly ${lineCount} lines, matching the input structure.

Text to improve:
${structure.content}

Respond with JSON: {"improved": "your improved text here"}`
            : `Improve the following text:
${structure.content}

Respond with JSON: {"improved": "your improved text here"}`;

          log('=== USER PROMPT ===');
          log(userMessage);

          await new Promise<void>((resolve, reject) => {
            client.improveText(
              systemPrompt,
              userMessage,
              {
                onChunk: async (chunk) => {
                  await streamingEditor.onChunk(chunk);
                },
                onComplete: async (usage) => {
                  await streamingEditor.finalize();
                  log('=== OUTPUT (raw from LLM) ===');
                  log(streamingEditor.getAccumulatedText());
                  log('=== OUTPUT (with structure restored) ===');
                  log(JSON.stringify(streamingEditor.getFinalText()));

                  if (usage) {
                    log('=== USAGE ===');
                    log(`Input tokens: ${usage.promptTokens}`);
                    log(`Output tokens: ${usage.completionTokens}`);
                    log(`Total tokens: ${usage.totalTokens}`);
                    log(`Estimated cost: $${usage.estimatedCost.toFixed(6)}`);
                    log('=============');
                  }
                  resolve();
                },
                onError: (error) => {
                  reject(error);
                },
              },
              abortController.signal
            );
          });

        } catch (error) {
          if (abortController.signal.aborted) {
            log('Operation cancelled by user');
            break;
          }
          const errorMessage = error instanceof Error ? error.message : String(error);
          log(`ERROR: ${errorMessage}`);
          vscode.window.showErrorMessage(`Failed to improve content: ${errorMessage}`);
          break;
        }
      }
    }
  );
}
