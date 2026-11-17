<script setup lang="ts">
import { marked } from "marked";
/* The page is BEGREPP.md in the repo root, so the file and the page never differ */
import source from "../../BEGREPP.md?raw";

/* Our own file, not user input, so it is safe to render as HTML */
const html = marked.parse(source, { async: false });
</script>

<template>
    <article class="terms" v-html="html" />
</template>

<style scoped>
.terms {
    max-width: 52rem;
}

.terms :deep(h2) {
    margin-top: 2.5rem;
}

.terms :deep(table) {
    width: 100%;
    margin-bottom: 1.5rem;
    border-collapse: collapse;
}

.terms :deep(th),
.terms :deep(td) {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--fkds-color-border-primary);
    text-align: left;
    vertical-align: top;
}

.terms :deep(th) {
    background: var(--fkds-color-background-secondary);
}

.terms :deep(pre) {
    padding: 1rem;
    overflow-x: auto;
    border-radius: var(--f-border-radius-medium, 4px);
    background: var(--fkds-color-background-secondary);
}

/* FKUI styles inline code as a block with margins; inside a pre it should be plain text */
.terms :deep(pre code) {
    display: block;
    margin: 0;
    padding: 0;
    background: none;
    white-space: pre;
}

.terms :deep(li) {
    margin-bottom: 0.25rem;
}
</style>
