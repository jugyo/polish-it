import * as vscode from "vscode";
import {
	type TextStructure,
	restoreTextStructure,
} from "../domain/textStructure";

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

		const finalText = restoreTextStructure(improvedText, this.structure);

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
