import { computed, ref, toValue, watch, type ComputedRef, type Ref } from "vue";
import type { TableColumn } from "@fkui/vue";

export interface ColumnOption {
    id: string;
    label: string;
    /** Required columns can not be hidden (the link column opens the detail page) */
    required: boolean;
}

export interface ColumnVisibility<T> {
    options: ComputedRef<ColumnOption[]>;
    /** Ids (headers) of the columns currently shown */
    visibleIds: Ref<string[]>;
    visibleColumns: ComputedRef<Array<TableColumn<T, keyof T>>>;
    showAll(): void;
}

function columnId<T>(column: TableColumn<T, keyof T>): string {
    return toValue(column.header);
}

function readHidden(storageKey: string): string[] {
    try {
        const raw = localStorage.getItem(storageKey);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
        return [];
    }
}

function writeHidden(storageKey: string, hidden: string[]): void {
    try {
        localStorage.setItem(storageKey, JSON.stringify(hidden));
    } catch {
        /* storage blocked: the choice just isn't remembered */
    }
}

/**
 * Keeps track of which table columns are shown. All columns are shown by
 * default; the hidden ones are remembered in localStorage per list, so a
 * column added later shows up automatically. The first column is the link to
 * the detail page and is always shown.
 */
export function useColumnVisibility<T>(
    columns: () => Array<TableColumn<T, keyof T>>,
    storageKey: string,
): ColumnVisibility<T> {
    const options = computed<ColumnOption[]>(() =>
        columns().map((column, index) => ({
            id: columnId(column),
            label: columnId(column),
            required: index === 0,
        })),
    );

    const hidden = readHidden(storageKey);
    const visibleIds = ref<string[]>(
        options.value.filter((o) => o.required || !hidden.includes(o.id)).map((o) => o.id),
    );

    watch(visibleIds, (visible) => {
        const nowHidden = options.value.filter((o) => !visible.includes(o.id)).map((o) => o.id);
        writeHidden(storageKey, nowHidden);
    });

    const visibleColumns = computed(() =>
        columns().filter((column, index) => index === 0 || visibleIds.value.includes(columnId(column))),
    );

    function showAll(): void {
        visibleIds.value = options.value.map((o) => o.id);
    }

    return { options, visibleIds, visibleColumns, showAll };
}
