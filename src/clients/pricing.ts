// Cost per 1M tokens (USD) - approximate as of Dec 2024
export interface TokenCost {
	input: number;
	output: number;
}

export function getCostPer1MTokens(model: string): TokenCost {
	const modelLower = model.toLowerCase();
	if (modelLower.includes("gpt-4o-mini")) {
		return { input: 0.15, output: 0.6 };
	}
	if (modelLower.includes("gpt-4o")) {
		return { input: 2.5, output: 10.0 };
	}
	if (modelLower.includes("gpt-4-turbo")) {
		return { input: 10.0, output: 30.0 };
	}
	if (modelLower.includes("gpt-4")) {
		return { input: 30.0, output: 60.0 };
	}
	if (modelLower.includes("gpt-3.5-turbo")) {
		return { input: 0.5, output: 1.5 };
	}
	// Default fallback
	return { input: 2.5, output: 10.0 };
}

export function calculateCost(
	model: string,
	promptTokens: number,
	completionTokens: number,
): number {
	const costs = getCostPer1MTokens(model);
	const inputCost = (promptTokens / 1_000_000) * costs.input;
	const outputCost = (completionTokens / 1_000_000) * costs.output;
	return inputCost + outputCost;
}
