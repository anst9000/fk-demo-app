import { useRouter } from "vue-router";
import { defineTableColumns } from "@fkui/vue";
import type { Case } from "../types/case";

/** Table columns for the case lists (browser-side and server-side paging) */
export function useCaseColumns() {
    const router = useRouter();

    return defineTableColumns<Case>([
        {
            header: "Ärendenummer",
            type: "anchor",
            key: "caseNumber",
            text: (row) => row.caseNumber,
            href: (row) => router.resolve({ name: "arende", params: { id: row.id } }).href,
            size: "shrink",
        },
        { header: "Namn", key: "name", type: "text" },
        { header: "Förmån", key: "benefit", type: "text" },
        { header: "Status", key: "status", type: "text" },
        { header: "Belopp (kr)", key: "amount", type: "text:currency", size: "shrink" },
        { header: "Inkom", key: "receivedDate", type: "text:date", size: "shrink" },
    ]);
}
