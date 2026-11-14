export type Environment = "Produktion" | "Test" | "Utveckling";

export interface Subsystem {
    id: number;
    name: string;
    code: string;
    /** The application this subsystem belongs to */
    applicationId: number;
    team: string;
    environment: Environment;
    version: string;
    /** ISO date, YYYY-MM-DD */
    lastDeployed: string;
}
