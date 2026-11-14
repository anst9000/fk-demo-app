import type { Case } from "../types/case";
import { createMockRepository } from "./mockRepository";

/** Number of generated cases. Change it to test the list with more or fewer rows. */
export const CASE_COUNT = 10_000;

let cache: Case[] | undefined;

export const caseRepository = createMockRepository<Case>(async () => {
    const { generateCases } = await import("../mock/generateCases");
    cache ??= generateCases(CASE_COUNT);
    return { default: cache };
});
