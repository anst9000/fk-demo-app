import { createApp } from "vue";
import { ValidationPlugin, setRunningContext } from "@fkui/vue";
import "@fkui/theme-default";
import "@fkui/design/lib/fonts.css";
import "@fkui/design";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";

const app = createApp(App);
setRunningContext(app);
app.use(ValidationPlugin);
app.use(router);
app.mount("#app");
