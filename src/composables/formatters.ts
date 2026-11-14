import type { ApplicationStatus } from "../types/application";
import type { CaseStatus } from "../types/case";
import type { Environment } from "../types/subsystem";

export type BadgeStatus = "default" | "warning" | "error" | "success" | "info";

const currency = new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
    return currency.format(amount);
}

export function caseStatusBadge(status: CaseStatus): BadgeStatus {
    switch (status) {
        case "Beviljad":
            return "success";
        case "Avslagen":
            return "error";
        case "Komplettering begärd":
            return "warning";
        case "Under handläggning":
            return "info";
        default:
            return "default";
    }
}

export function applicationStatusBadge(status: ApplicationStatus): BadgeStatus {
    switch (status) {
        case "I produktion":
            return "success";
        case "Under utveckling":
            return "info";
        case "Under avveckling":
            return "warning";
        default:
            return "default";
    }
}

export function environmentBadge(environment: Environment): BadgeStatus {
    return environment === "Produktion" ? "success" : environment === "Test" ? "warning" : "info";
}
