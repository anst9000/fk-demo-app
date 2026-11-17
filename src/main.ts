import { createApp, defineComponent, h, markRaw } from "vue";
import {
    ErrorPlugin,
    FErrorHandlingApp,
    FormatPlugin,
    ValidationPlugin,
    setRunningContext,
} from "@fkui/vue";
import icons from "@fkui/icon-lib-default";
import "@fkui/theme-default";
import "@fkui/design/lib/fonts.css";
import "@fkui/design";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";

/* FKUI's licence-free icons (used by tooltips, expandable panels, the datepicker, ...) */
icons.f.injectSpritesheet();

/*
 * FErrorHandlingApp shows FKUI's general error page instead of the app when an unhandled error occurs
 * (ErrorPlugin catches it). Vue's development warnings are not treated as errors here.
 */
const Root = defineComponent({
    name: "Root",
    render() {
        return h(FErrorHandlingApp, { defaultComponent: markRaw(App) });
    },
});

const app = createApp(Root);
setRunningContext(app);
app.use(ErrorPlugin, { captureWarnings: false });
app.use(ValidationPlugin);
app.use(FormatPlugin);
app.use(router);
app.mount("#app");
