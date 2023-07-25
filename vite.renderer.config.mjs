import { defineConfig } from "vite";
import VuePlugin from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
    plugins: [VuePlugin()],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src/renderer"),
        },
    },
});
