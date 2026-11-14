import { createApp } from "vue";
import { FormatPlugin, ValidationPlugin, setRunningContext } from "@fkui/vue";
import icons from "@fkui/icon-lib-default";
import "@fkui/theme-default";
import "@fkui/design/lib/fonts.css";
import "@fkui/design";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";

/* FKUI's licence-free icons (used by tooltips, expandable panels, the datepicker, ...) */
icons.f.injectSpritesheet();

const app = createApp(App);
setRunningContext(app);
app.use(ValidationPlugin);
app.use(FormatPlugin);
app.use(router);
app.mount("#app");
