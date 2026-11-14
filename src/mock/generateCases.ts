import type { Case, CaseStatus } from "../types/case";

const firstNames = [
    "Anna", "Erik", "Maria", "Lars", "Karin", "Johan", "Sara", "Anders",
    "Elin", "Mikael", "Emma", "Per", "Linnea", "Oskar", "Ida", "Nils",
];
const lastNames = [
    "Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson",
    "Olsson", "Persson", "Svensson", "Gustafsson", "Lindberg", "Holm",
];
const benefits = [
    "Föräldrapenning", "Sjukpenning", "Bostadsbidrag", "Barnbidrag",
    "Tillfällig föräldrapenning", "Aktivitetsersättning",
];
const statuses: CaseStatus[] = [
    "Inkommen", "Under handläggning", "Beviljad", "Avslagen", "Komplettering begärd",
];

/**
 * Generates `count` made-up cases. The random generator has a fixed seed, so
 * the same id always gives the same case (detail URLs keep working).
 */
export function generateCases(count: number): Case[] {
    let seed = 42;
    const random = (): number => {
        seed = (seed * 1103515245 + 12345) % 2147483648;
        return seed / 2147483648;
    };
    const pick = <T>(list: readonly T[]): T => list[Math.floor(random() * list.length)];
    const startOfYear = Date.UTC(2026, 0, 1);
    const day = 86_400_000;

    const cases: Case[] = [];
    for (let id = 1; id <= count; id++) {
        const received = new Date(startOfYear + Math.floor(random() * 300) * day);
        cases.push({
            id,
            caseNumber: `FK-2026-${String(10000 + id * 37).padStart(6, "0")}`,
            name: `${pick(firstNames)} ${pick(lastNames)}`,
            benefit: pick(benefits),
            status: pick(statuses),
            amount: Math.round(random() * 30000 + 500),
            receivedDate: received.toISOString().slice(0, 10),
        });
    }
    return cases;
}
