export type CaseStatus =
    | "Inkommen"
    | "Under handläggning"
    | "Beviljad"
    | "Avslagen"
    | "Komplettering begärd";

export interface Case {
    id: number;
    caseNumber: string;
    name: string;
    benefit: string;
    status: CaseStatus;
    /** Amount in SEK */
    amount: number;
    /** ISO date, YYYY-MM-DD */
    receivedDate: string;
}
