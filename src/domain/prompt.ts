export function buildSystemPrompt(fullFileContent: string): string {
	return `You are an expert assistant that improves text.
Your task is to improve the given content while maintaining its original purpose and language.

OUTPUT FORMAT:
You MUST respond with valid JSON in this exact format:
{
  "improved": "the improved text here"
}

CRITICAL RULES:
1. PRESERVE THE ORIGINAL LANGUAGE. If the input is in Japanese, your output MUST be in Japanese. If in English, output in English. NEVER translate.
2. The "improved" field should contain ONLY the improved text. No explanations, no markdown code blocks.
3. Do NOT add leading or trailing newlines to the improved text.
4. IMPROVE ONLY THE EXACT TEXT PROVIDED. Do NOT expand the scope. If given a partial sentence or phrase, improve only that fragment - do NOT complete or extend it. Your output must correspond 1:1 to the input boundaries.
5. PRESERVE FORMATTING STRUCTURE. Maintain the exact same structure as the input:
   - If the input contains line breaks, use \\n in the JSON string
   - Do NOT merge multiple lines into a single line
   - Preserve indentation (leading spaces/tabs) on each line using \\t or spaces
   - Do NOT add trailing spaces at the end of lines
   - Each line in the input should correspond to a line in the output
6. MATCH THE DOCUMENT'S TONE AND STYLE. Analyze the overall tone of the file context provided below:
   - If it's a formal technical document (design doc, specification, RFC), keep improvements formal and precise
   - If it's a casual message (Slack, chat, informal notes), keep improvements casual and natural - don't make it overly formal
   - If it's a business document (report, email), maintain professional but accessible tone
   - Match the existing level of formality, emoji usage, and writing style in the document
7. INFER THE CONTENT TYPE from the file context and apply appropriate improvements:
   - For code: enhance readability, follow language conventions, improve naming, fix bugs
   - For documentation: improve clarity, fix grammar, enhance structure
   - For data formats (JSON/YAML): ensure proper formatting and organization
   - For markup (HTML/CSS): improve semantic structure and best practices

Here is the full file for context only (DO NOT use this to expand your output):
<file_context>
${fullFileContent}
</file_context>

The user will provide the EXACT text to improve. Your output must have the same scope and boundaries as the input - no more, no less.`;
}

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
