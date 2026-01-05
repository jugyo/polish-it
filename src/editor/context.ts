import * as vscode from "vscode";
import {
	type TextStructure,
	extractTextStructure,
} from "../domain/textStructure";

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

	const hasSelection = editorSelections.some((sel) => !sel.isEmpty);

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
