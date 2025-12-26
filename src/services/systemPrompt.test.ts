import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "./systemPrompt";

describe("systemPrompt", () => {
	describe("buildSystemPrompt", () => {
		const fileContent = "const x = 1;\nconst y = 2;";

		it("should include base instructions", () => {
			const prompt = buildSystemPrompt(fileContent);

			expect(prompt).toContain("PRESERVE THE ORIGINAL LANGUAGE");
			expect(prompt).toContain("Do NOT add leading or trailing newlines");
			expect(prompt).toContain("INFER THE CONTENT TYPE");
		});

		it("should include file context", () => {
			const prompt = buildSystemPrompt(fileContent);

			expect(prompt).toContain("<file_context>");
			expect(prompt).toContain(fileContent);
			expect(prompt).toContain("</file_context>");
		});

		it("should include general improvement guidelines", () => {
			const prompt = buildSystemPrompt(fileContent);

			expect(prompt).toContain("For code: enhance readability");
			expect(prompt).toContain("For documentation: improve clarity");
			expect(prompt).toContain("For data formats (JSON/YAML)");
			expect(prompt).toContain("For markup (HTML/CSS)");
		});
	});
});
