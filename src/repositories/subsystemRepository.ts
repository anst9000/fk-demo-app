import type { Subsystem } from "../types/subsystem";
import { createMockRepository } from "./mockRepository";

const base = createMockRepository<Subsystem>(
    () => import("../mock/subsystems.json"),
);

export const subsystemRepository = {
    ...base,
    async getByApplicationId(applicationId: number): Promise<Subsystem[]> {
        const all = await base.getAll();
        return all.filter((s) => s.applicationId === applicationId);
    },
};
