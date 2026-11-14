import { ref, shallowRef, watch, type Ref, type ShallowRef, type WatchSource } from "vue";

export interface Resource<T> {
    data: ShallowRef<T | undefined>;
    loading: Ref<boolean>;
    error: Ref<string | null>;
    reload(): Promise<void>;
}

/**
 * Loads data asynchronously and keeps track of loading and error state.
 * When `source` is given the data is reloaded whenever it changes
 * (e.g. the id route parameter). Responses that arrive out of order are ignored.
 */
export function useResource<T>(loader: () => Promise<T>, source?: WatchSource): Resource<T> {
    const data = shallowRef<T>();
    const loading = ref(true);
    const error = ref<string | null>(null);
    let requestId = 0;

    async function reload(): Promise<void> {
        const current = ++requestId;
        loading.value = true;
        error.value = null;
        try {
            const result = await loader();
            if (current === requestId) {
                data.value = result;
            }
        } catch (e) {
            if (current === requestId) {
                error.value = e instanceof Error ? e.message : String(e);
            }
        } finally {
            if (current === requestId) {
                loading.value = false;
            }
        }
    }

    if (source) {
        watch(source, reload, { immediate: true });
    } else {
        void reload();
    }

    return { data, loading, error, reload };
}
