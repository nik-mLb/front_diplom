import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";

// Раздаёт заглушку для превью товара по /media/product-default,
// как это делал кастомный middleware в старом webpack.config.js.
function mediaDefaultImagePlugin(): Plugin {
    return {
        name: "media-default-image",
        configureServer(server) {
            server.middlewares.use("/media/product-default", (_req, res) => {
                const filePath = path.resolve(
                    __dirname,
                    "src/shared/images/cover.jpeg",
                );
                res.setHeader("Content-Type", "image/jpeg");
                fs.createReadStream(filePath).pipe(res);
            });
        },
    };
}

export default defineConfig({
    plugins: [
        react(),
        mediaDefaultImagePlugin(),
        VitePWA({
            // manifest.webmanifest уже лежит в public/ и подключён в index.html вручную —
            // не даём плагину генерировать свой (и не переопределяем существующий).
            manifest: false,
            registerType: "autoUpdate",
            workbox: {
                // precache-манифест собирается автоматически из реального билда
                // (вместо захардкоженных имён файлов в старом public/sw.ts).
                globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,woff,woff2,ttf,eot}"],
            },
        }),
    ],

    build: {
        outDir: "build",
    },

    server: {
        port: 7500,
        host: "0.0.0.0",
        proxy: {
            // Если запрос пришёл со страницы рекламного iframe (/ad/...),
            // те же пути /api/* уходят на re-target.ru, иначе — на бэкенд.
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
                router: (req) => {
                    const referer = req.headers.referer ?? "";
                    return referer.includes("/ad/")
                        ? "https://re-target.ru"
                        : "http://localhost:8080";
                },
            },
            "/ad": {
                target: "https://re-target.ru",
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/ad/, "/api/v1"),
            },
        },
    },
});
