import type { Case } from "../types/case";
import { createMockRepository } from "./mockRepository";

export const caseRepository = createMockRepository<Case>(
    () => import("../mock/cases.json"),
);
