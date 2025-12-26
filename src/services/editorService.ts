import * as vscode from "vscode";
import {
	extractTextStructure,
	restoreTextStructure,
	TextStructure,
} from "./textStructure";

export { TextStructure, extractTextStructure, restoreTextStructure };

export interface SelectionTarget {
	targetRange: vscode.Range;
	originalText: string;
	structure: TextStructure;
}

export interface EditorContext {
	editor: vscode.TextEditor;
	document: vscode.TextDocument;
	selections: SelectionTarget[];
	hasSelection: boolean;
	fullFileContent: string;
}

export function getEditorContext(): EditorContext | null {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return null;
	}

	const document = editor.document;
	const editorSelections = editor.selections;

	// Check if any selection is non-empty
	const hasSelection = editorSelections.some((sel) => !sel.isEmpty);

	// Build selection targets, sorted by position (top to bottom)
	const selections: SelectionTarget[] = editorSelections
		.map((selection) => {
			const targetRange = !selection.isEmpty
				? new vscode.Range(selection.start, selection.end)
				: document.lineAt(selection.active.line).range;
			const originalText = document.getText(targetRange);
			const structure = extractTextStructure(originalText);
			return { targetRange, originalText, structure };
		})
		.sort((a, b) => a.targetRange.start.compareTo(b.targetRange.start));

	const fullFileContent = document.getText();

	return {
		editor,
		document,
		selections,
		hasSelection,
		fullFileContent,
	};
}

export class StreamingEditor {
	private editor: vscode.TextEditor;
	private targetRange: vscode.Range;
	private structure: TextStructure;
	private jsonBuffer = "";

	constructor(
		editor: vscode.TextEditor,
		targetRange: vscode.Range,
		structure: TextStructure,
	) {
		this.editor = editor;
		this.targetRange = targetRange;
		this.structure = structure;
	}

	async onChunk(chunk: string): Promise<void> {
		this.jsonBuffer += chunk;
	}

	async finalize(): Promise<void> {
		// Parse JSON to extract improved text
		let improvedText = "";
		try {
			const parsed = JSON.parse(this.jsonBuffer);
			if (parsed.improved !== undefined) {
				improvedText = parsed.improved;
			}
		} catch (error) {
			console.error("Failed to parse JSON:", error);
			return;
		}

		// Restore text structure (indentation and newlines)
		const finalText = restoreTextStructure(improvedText, this.structure);

		// Replace the target range with the final text in one operation
		await this.editor.edit(
			(editBuilder) => {
				editBuilder.replace(this.targetRange, finalText);
			},
			{ undoStopBefore: true, undoStopAfter: true },
		);
	}

	getAccumulatedText(): string {
		try {
			const parsed = JSON.parse(this.jsonBuffer);
			return parsed.improved || "";
		} catch {
			return "";
		}
	}

	getFinalText(): string {
		const improvedText = this.getAccumulatedText();
		return restoreTextStructure(improvedText, this.structure);
	}
}
