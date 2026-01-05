import * as vscode from "vscode";
import { improveCommand } from "./improveCommand";

export function activate(context: vscode.ExtensionContext): void {
	console.log("Polish It extension is now active!");

	const improveDisposable = vscode.commands.registerCommand(
		"polishIt.polish",
		improveCommand,
	);

	context.subscriptions.push(improveDisposable);
}

export function deactivate(): void {
	console.log("Polish It extension is now deactivated.");
}
