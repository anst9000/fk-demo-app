export type ApplicationStatus =
    | "I produktion"
    | "Under utveckling"
    | "Under avveckling"
    | "Avvecklad";

export interface Application {
    id: number;
    name: string;
    shortName: string;
    owner: string;
    status: ApplicationStatus;
    technology: string;
    /** Year the application went live */
    launched: string;
    description: string;
}
