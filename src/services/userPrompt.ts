export function buildUserPrompt(content: string): string {
	const lines = content.split("\n");
	const lineCount = lines.length;

	if (lineCount > 1) {
		return `Improve the following text. The improved text MUST have exactly ${lineCount} lines, matching the input structure.

Text to improve:
${content}

Respond with JSON: {"improved": "your improved text here"}`;
	}

	return `Improve the following text:
${content}

Respond with JSON: {"improved": "your improved text here"}`;
}
