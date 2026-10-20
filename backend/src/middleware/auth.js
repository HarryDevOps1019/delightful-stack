import { supabase } from "../data/supabase.js";

function getBearerToken(req) {
  const [scheme, token] = String(req.headers.authorization || "").split(" ");
  return scheme === "Bearer" && token ? token : null;
}

export async function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Authentication is required" });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ success: false, error: "Invalid or expired session" });
  }

  req.user = data.user;
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.app_metadata?.role !== "admin") {
    return res.status(403).json({ success: false, error: "Administrator access is required" });
  }
  next();
}
