import { createApp } from "vue";
import { setRunningContext } from "@fkui/vue";
import "@fkui/theme-default";
import "@fkui/design/lib/fonts.css";
import "@fkui/design";
import App from "./App.vue";

const app = createApp(App);
setRunningContext(app);
app.mount("#app");
