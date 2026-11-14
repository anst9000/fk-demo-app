import type { Application } from "../types/application";
import { createMockRepository } from "./mockRepository";

export const applicationRepository = createMockRepository<Application>(
    () => import("../mock/applications.json"),
);
