import * as vscode from "vscode";
import { buildSystemPrompt, buildUserPrompt } from "./domain/prompt";
import { getEditorContext } from "./editor/context";
import { log } from "./editor/logger";
import { StreamingEditor } from "./editor/streamingEditor";
import { OpenAIClient } from "./infrastructure/openai";

export async function improveCommand(): Promise<void> {
	const context = getEditorContext();
	if (!context) {
		vscode.window.showErrorMessage("No active editor found.");
		return;
	}

	const { editor, document, selections, fullFileContent, hasSelection } =
		context;

	const hasContent = selections.some((sel) => sel.originalText.trim());
	if (!hasContent) {
		vscode.window.showWarningMessage("No content to improve.");
		return;
	}

	const systemPrompt = buildSystemPrompt(fullFileContent);

	log("=== SYSTEM PROMPT ===");
	log(systemPrompt);
	log(`=== Processing ${selections.length} selection(s) ===`);

	const abortController = new AbortController();

	await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: hasSelection
				? `Improving ${selections.length} selection(s)...`
				: `Improving ${selections.length} line(s)...`,
			cancellable: true,
		},
		async (_progress, token) => {
			token.onCancellationRequested(() => {
				abortController.abort();
			});

			for (let i = 0; i < selections.length; i++) {
				if (abortController.signal.aborted) {
					break;
				}

				const { structure } = selections[i];

				const currentSelections = editor.selections;
				const currentSelection = currentSelections[i];
				if (!currentSelection) {
					continue;
				}

				const targetRange = !currentSelection.isEmpty
					? new vscode.Range(currentSelection.start, currentSelection.end)
					: document.lineAt(currentSelection.active.line).range;

				const currentText = document.getText(targetRange);

				if (!currentText.trim()) {
					continue;
				}

				log(`=== Selection ${i + 1}/${selections.length} ===`);
				log(
					`Target range: (${targetRange.start.line}:${targetRange.start.character}) - (${targetRange.end.line}:${targetRange.end.character})`,
				);
				log(`Content: ${JSON.stringify(structure.content)}`);

				try {
					const client = new OpenAIClient();
					const streamingEditor = new StreamingEditor(
						editor,
						targetRange,
						structure,
					);

					const userMessage = buildUserPrompt(structure.content);

					log("=== USER PROMPT ===");
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
									log("=== OUTPUT (raw from LLM) ===");
									log(streamingEditor.getAccumulatedText());
									log("=== OUTPUT (with structure restored) ===");
									log(JSON.stringify(streamingEditor.getFinalText()));

									if (usage) {
										log("=== USAGE ===");
										log(`Input tokens: ${usage.promptTokens}`);
										log(`Output tokens: ${usage.completionTokens}`);
										log(`Total tokens: ${usage.totalTokens}`);
										log(
											`Context window: ${usage.totalTokens.toLocaleString()} / ${usage.contextWindowSize.toLocaleString()} (${usage.contextUsagePercent.toFixed(2)}%)`,
										);
										log(`Estimated cost: $${usage.estimatedCost.toFixed(6)}`);
										log("=============");
									}
									resolve();
								},
								onError: (error) => {
									reject(error);
								},
							},
							abortController.signal,
						);
					});
				} catch (error) {
					if (abortController.signal.aborted) {
						log("Operation cancelled by user");
						break;
					}
					const errorMessage =
						error instanceof Error ? error.message : String(error);
					log(`ERROR: ${errorMessage}`);
					vscode.window.showErrorMessage(
						`Failed to improve content: ${errorMessage}`,
					);
					break;
				}
			}
		},
	);
}
