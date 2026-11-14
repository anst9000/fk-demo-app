import type { Case } from "../types/case";

export interface CaseRepository {
    getAll(): Promise<Case[]>;
}

/**
 * Mock repository that behaves like a backend call: the JSON file is loaded
 * lazily and the response is delayed to simulate network latency.
 * Swap this for an HTTP implementation later without touching the components.
 */
export function createMockCaseRepository(delayMs = 600): CaseRepository {
    return {
        async getAll(): Promise<Case[]> {
            const module = await import("../mock/cases.json");
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            return structuredClone(module.default as Case[]);
        },
    };
}

export const caseRepository: CaseRepository = createMockCaseRepository();
