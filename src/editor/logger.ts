import * as vscode from "vscode";

let outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
	if (!outputChannel) {
		outputChannel = vscode.window.createOutputChannel("Polish It");
	}
	return outputChannel;
}

export function log(message: string): void {
	const channel = getOutputChannel();
	const timestamp = new Date().toISOString();
	channel.appendLine(`[${timestamp}] ${message}`);
}
