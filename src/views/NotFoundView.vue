<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
    <h1>Sidan finns inte</h1>
    <p>Adressen du försökte öppna finns inte i den här applikationen.</p>
    <router-link to="/" class="button button--primary">Till startsidan</router-link>
</template>
