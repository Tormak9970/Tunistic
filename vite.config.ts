import { svelte } from "@sveltejs/vite-plugin-svelte";
import { rmdirSync } from "fs";
import { resolve } from "path";
import sveltePreprocess from "svelte-preprocess";
import { defineConfig } from "vite";

type ExcludeOptions = {
  directories: string[]
}

/**
 * Removes the provided directories from build.
 * @param config The plugin's configuration options.
 * @returns A Vite plugin.
 */
function excludeDirectories(config?: ExcludeOptions) {
  return {
    name: 'remove-progress-images',
    resolveId (source: string) {
      return source === 'virtual-module' ? source : null;
    },
    renderStart (outputOptions: any, inputOptions: any) {
      const outDir = outputOptions.dir;
      
      if (config) {
        for (const directory of config.directories) {
          const directoryPath = resolve(outDir, directory);
          rmdirSync(directoryPath, { recursive: true });
          console.log(`Deleted ${directoryPath}`);
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      preprocess: [
        sveltePreprocess({
          typescript: true,
        }),
      ],
    }),
    excludeDirectories({
      directories: ["readme-images"]
    })
  ],

  resolve: {
    alias: {
      "@interactables": resolve(__dirname, "./src/components/interactables"),
      "@layout": resolve(__dirname, "./src/components/layout"),
      "@views": resolve(__dirname, "./src/components/views"),
      "@overlays": resolve(__dirname, "./src/components/overlays"),
      "@component-utils": resolve(__dirname, "./src/components/utils"),
      "@lib": resolve(__dirname, "./src/lib"),
      "@stores": resolve(__dirname, "./src/stores"),
      "@routes": resolve(__dirname, "./src/routes"),
    }
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari15",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.html')
      },
      external: [
        "/public/readme-images"
      ],
    },
  },
  define: {
    'APP_VERSION': JSON.stringify(process.env.npm_package_version)
  }
});
