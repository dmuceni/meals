import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 5174);

loadLocalEnv();

const apiRoutes = new Map([
  ["/api/diet", "diet.js"],
  ["/api/me", "me.js"],
  ["/api/blob-upload", "blob-upload.js"]
]);

const vite = await createViteServer({
  root,
  appType: "spa",
  server: {
    middlewareMode: true,
    host: "0.0.0.0"
  }
});

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`).pathname;

  if (pathname.startsWith("/api/")) {
    await handleApi(pathname, req, res);
    return;
  }

  vite.middlewares(req, res, () => {
    res.statusCode = 404;
    res.end("Not found");
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Local app with API ready at http://localhost:${port}/`);
});

async function handleApi(pathname, req, res) {
  const fileName = apiRoutes.get(pathname);
  if (!fileName) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "API route not found." }));
    return;
  }

  try {
    const moduleUrl = pathToFileURL(path.join(root, "api", fileName));
    moduleUrl.search = `t=${Date.now()}`;
    const mod = await import(moduleUrl.href);
    await mod.default(req, res);
  } catch (error) {
    res.statusCode = error.status || 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: error.message || "Errore inatteso." }));
  }
}

function loadLocalEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (key) process.env[key] = value;
  }
}
