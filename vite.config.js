import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function extractBooks() {
  return readFileSync(resolve(process.cwd(), "books.json"), "utf8");
}

function libraryDataPlugin() {
  return {
    name: "library-data",
    configureServer(server) {
      server.middlewares.use("/books.json", (_request, response) => {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.end(extractBooks());
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "books.json", source: extractBooks() });
    },
  };
}

export default defineConfig({
  base: "/books/",
  plugins: [react(), libraryDataPlugin()],
  publicDir: "covers",
  build: { target: "es2020" },
});
