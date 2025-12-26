// Extract leading/trailing newlines and base indentation from text
export interface TextStructure {
	leadingNewlines: string;
	trailingNewlines: string;
	baseIndent: string;
	content: string;
}

export function extractTextStructure(text: string): TextStructure {
	// Extract leading newlines
	const leadingMatch = text.match(/^(\n*)/);
	const leadingNewlines = leadingMatch ? leadingMatch[1] : "";

	// Extract trailing newlines
	const trailingMatch = text.match(/(\n*)$/);
	const trailingNewlines = trailingMatch ? trailingMatch[1] : "";

	// Get content without leading/trailing newlines
	const contentWithoutNewlines = text.slice(
		leadingNewlines.length,
		text.length - trailingNewlines.length || undefined,
	);

	// Extract base indentation from the first non-empty line
	const firstLineMatch = contentWithoutNewlines.match(/^([ \t]*)/);
	const baseIndent = firstLineMatch ? firstLineMatch[1] : "";

	// Remove base indentation from all lines to get clean content
	const lines = contentWithoutNewlines.split("\n");
	const contentLines = lines.map((line) => {
		if (line.startsWith(baseIndent)) {
			return line.slice(baseIndent.length);
		}
		return line;
	});
	const content = contentLines.join("\n");

	return { leadingNewlines, trailingNewlines, baseIndent, content };
}

// Restore indentation to text
export function restoreTextStructure(
	text: string,
	structure: TextStructure,
): string {
	const lines = text.split("\n");
	const indentedLines = lines.map((line) => {
		// Add base indent to all lines (except empty lines)
		if (line.length > 0) {
			return structure.baseIndent + line;
		}
		return line;
	});
	return (
		structure.leadingNewlines +
		indentedLines.join("\n") +
		structure.trailingNewlines
	);
}
