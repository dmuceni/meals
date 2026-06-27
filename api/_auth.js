import { createClient } from "@supabase/supabase-js";

export function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function requireUser(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    const error = new Error("Token mancante.");
    error.status = 401;
    throw error;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    const error = new Error("Config Supabase server mancante.");
    error.status = 500;
    throw error;
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error: authError } = await supabase.auth.getUser(token);
  if (authError || !data.user) {
    const error = new Error("Sessione non valida.");
    error.status = 401;
    throw error;
  }
  return data.user;
}

export function handleError(res, error) {
  json(res, error.status || 500, { error: error.message || "Errore inatteso." });
}
