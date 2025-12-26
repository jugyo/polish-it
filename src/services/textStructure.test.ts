import { describe, expect, it } from "vitest";
import {
	extractTextStructure,
	restoreTextStructure,
	type TextStructure,
} from "./textStructure";

describe("textStructure", () => {
	describe("extractTextStructure", () => {
		it("should extract content without any special structure", () => {
			const result = extractTextStructure("hello world");
			expect(result).toEqual({
				leadingNewlines: "",
				trailingNewlines: "",
				baseIndent: "",
				content: "hello world",
			});
		});

		it("should extract leading newlines", () => {
			const result = extractTextStructure("\n\nhello world");
			expect(result.leadingNewlines).toBe("\n\n");
			expect(result.content).toBe("hello world");
		});

		it("should extract trailing newlines", () => {
			const result = extractTextStructure("hello world\n\n");
			expect(result.trailingNewlines).toBe("\n\n");
			expect(result.content).toBe("hello world");
		});

		it("should extract both leading and trailing newlines", () => {
			const result = extractTextStructure("\nhello world\n");
			expect(result.leadingNewlines).toBe("\n");
			expect(result.trailingNewlines).toBe("\n");
			expect(result.content).toBe("hello world");
		});

		it("should extract base indentation with spaces", () => {
			const result = extractTextStructure("    indented text");
			expect(result.baseIndent).toBe("    ");
			expect(result.content).toBe("indented text");
		});

		it("should extract base indentation with tabs", () => {
			const result = extractTextStructure("\t\tindented text");
			expect(result.baseIndent).toBe("\t\t");
			expect(result.content).toBe("indented text");
		});

		it("should remove base indentation from all lines", () => {
			const input = "  line1\n  line2\n    line3";
			const result = extractTextStructure(input);
			expect(result.baseIndent).toBe("  ");
			expect(result.content).toBe("line1\nline2\n  line3");
		});

		it("should handle mixed content", () => {
			const input = "\n  first\n  second\n";
			const result = extractTextStructure(input);
			expect(result.leadingNewlines).toBe("\n");
			expect(result.trailingNewlines).toBe("\n");
			expect(result.baseIndent).toBe("  ");
			expect(result.content).toBe("first\nsecond");
		});

		it("should handle empty string", () => {
			const result = extractTextStructure("");
			expect(result).toEqual({
				leadingNewlines: "",
				trailingNewlines: "",
				baseIndent: "",
				content: "",
			});
		});

		it("should handle only newlines", () => {
			const result = extractTextStructure("\n\n\n");
			// When text is only newlines, regex matches overlap
			expect(result.leadingNewlines).toBe("\n\n\n");
			expect(result.trailingNewlines).toBe("\n\n\n");
			expect(result.content).toBe("");
		});

		it("should handle lines with less indentation than base", () => {
			const input = "    indented\nno indent";
			const result = extractTextStructure(input);
			expect(result.baseIndent).toBe("    ");
			expect(result.content).toBe("indented\nno indent");
		});
	});

	describe("restoreTextStructure", () => {
		it("should restore text without structure", () => {
			const structure: TextStructure = {
				leadingNewlines: "",
				trailingNewlines: "",
				baseIndent: "",
				content: "",
			};
			const result = restoreTextStructure("hello world", structure);
			expect(result).toBe("hello world");
		});

		it("should restore leading newlines", () => {
			const structure: TextStructure = {
				leadingNewlines: "\n\n",
				trailingNewlines: "",
				baseIndent: "",
				content: "",
			};
			const result = restoreTextStructure("hello world", structure);
			expect(result).toBe("\n\nhello world");
		});

		it("should restore trailing newlines", () => {
			const structure: TextStructure = {
				leadingNewlines: "",
				trailingNewlines: "\n\n",
				baseIndent: "",
				content: "",
			};
			const result = restoreTextStructure("hello world", structure);
			expect(result).toBe("hello world\n\n");
		});

		it("should restore base indentation", () => {
			const structure: TextStructure = {
				leadingNewlines: "",
				trailingNewlines: "",
				baseIndent: "    ",
				content: "",
			};
			const result = restoreTextStructure("line1\nline2", structure);
			expect(result).toBe("    line1\n    line2");
		});

		it("should not add indent to empty lines", () => {
			const structure: TextStructure = {
				leadingNewlines: "",
				trailingNewlines: "",
				baseIndent: "  ",
				content: "",
			};
			const result = restoreTextStructure("line1\n\nline2", structure);
			expect(result).toBe("  line1\n\n  line2");
		});

		it("should restore all structure elements", () => {
			const structure: TextStructure = {
				leadingNewlines: "\n",
				trailingNewlines: "\n",
				baseIndent: "  ",
				content: "",
			};
			const result = restoreTextStructure("first\nsecond", structure);
			expect(result).toBe("\n  first\n  second\n");
		});

		it("should handle empty input", () => {
			const structure: TextStructure = {
				leadingNewlines: "\n",
				trailingNewlines: "\n",
				baseIndent: "  ",
				content: "",
			};
			const result = restoreTextStructure("", structure);
			expect(result).toBe("\n\n");
		});

		it("should be inverse of extractTextStructure for simple cases", () => {
			const original = "  hello\n  world";
			const structure = extractTextStructure(original);
			const restored = restoreTextStructure(structure.content, structure);
			expect(restored).toBe(original);
		});

		it("should be inverse of extractTextStructure with newlines", () => {
			const original = "\n  line1\n  line2\n";
			const structure = extractTextStructure(original);
			const restored = restoreTextStructure(structure.content, structure);
			expect(restored).toBe(original);
		});

		it("should be inverse for complex multi-line content", () => {
			const original = "\n\n    function test() {\n      return 1;\n    }\n";
			const structure = extractTextStructure(original);
			const restored = restoreTextStructure(structure.content, structure);
			expect(restored).toBe(original);
		});
	});

	describe("Windows line endings (CRLF)", () => {
		// Note: Current implementation does not fully support CRLF.
		// These tests document current behavior and can be updated when CRLF support is added.

		it("should handle CRLF line endings in extractTextStructure", () => {
			const input = "line1\r\nline2\r\nline3";
			const result = extractTextStructure(input);
			expect(result.content).toContain("line1");
			expect(result.content).toContain("line2");
			expect(result.content).toContain("line3");
		});

		it.todo("should handle leading CRLF newlines (not yet supported)");

		it.todo("should handle trailing CRLF newlines (not yet supported)");

		it.todo(
			"should handle mixed CRLF content with indentation (not yet supported)",
		);

		it("should preserve CRLF in content when no leading/trailing newlines", () => {
			const input = "line1\r\nline2";
			const result = extractTextStructure(input);
			// CRLF is preserved in content
			expect(result.content).toBe("line1\r\nline2");
		});
	});

	describe("edge cases", () => {
		it("should handle whitespace-only content", () => {
			const result = extractTextStructure("   ");
			expect(result.baseIndent).toBe("   ");
			expect(result.content).toBe("");
		});

		it("should handle single character", () => {
			const result = extractTextStructure("a");
			expect(result.content).toBe("a");
			expect(result.leadingNewlines).toBe("");
			expect(result.trailingNewlines).toBe("");
			expect(result.baseIndent).toBe("");
		});

		it("should handle very deep indentation", () => {
			const indent = "                    "; // 20 spaces
			const input = `${indent}deeply indented`;
			const result = extractTextStructure(input);
			expect(result.baseIndent).toBe(indent);
			expect(result.content).toBe("deeply indented");
		});

		it("should handle mixed tabs and spaces", () => {
			const input = "\t  mixed indent";
			const result = extractTextStructure(input);
			expect(result.baseIndent).toBe("\t  ");
			expect(result.content).toBe("mixed indent");
		});
	});
});
