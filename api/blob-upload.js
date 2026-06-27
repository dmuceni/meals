import { put } from "@vercel/blob";
import { handleError, json, readJson, requireUser } from "./_auth.js";

export default async function handler(req, res) {
  try {
    await requireUser(req);
    if (req.method !== "POST") {
      json(res, 405, { error: "Metodo non supportato." });
      return;
    }

    const { fileName, contentType, base64 } = await readJson(req);
    if (!fileName || !base64) {
      json(res, 422, { error: "fileName e base64 obbligatori." });
      return;
    }

    const buffer = Buffer.from(base64, "base64");
    const blob = await put(`meal-assets/${Date.now()}-${fileName}`, buffer, {
      access: "public",
      contentType: contentType || "application/octet-stream"
    });
    json(res, 200, { blob });
  } catch (error) {
    handleError(res, error);
  }
}
