import { defineConfig } from "@tanstack/react-start/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "unenv";
import nitroCloudflareBindings from "nitro-cloudflare-dev";

export default defineConfig({
  tsr: {
    appDirectory: "src",
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
  server: {
    preset: "cloudflare-module",
    unenv: cloudflare,
    modules: [nitroCloudflareBindings],
  },
});
