import express from "express";
import { supabase, createAuthClient } from "../data/supabase.js";

const router = express.Router();

/**
 * Configured administrator credentials. Used ONLY to bootstrap the first admin account
 * in Supabase Auth when no admin exists yet. After the admin changes their
 * email/password from Admin → Settings, these defaults stop working.
 * Configure ADMIN_EMAIL / ADMIN_PASSWORD in backend/.env before first use.
 */
const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const DEFAULT_ADMIN_NAME = "Store Administrator";

/**
 * Helper to extract Bearer token from Authorization header
 */
function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  return parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;
}

/**
 * Admin role is stored in app_metadata, which only the service-role key can
 * modify (users cannot edit it themselves, unlike user_metadata).
 */
function isAdminUser(user) {
  return user?.app_metadata?.role === "admin";
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email.split("@")[0],
    role: isAdminUser(user) ? "admin" : "customer",
  };
}

async function listAllUsers() {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data?.users || [];
}

/**
 * Ensures exactly one admin account exists in Supabase Auth.
 * - If an admin (app_metadata.role === "admin") exists → nothing to do.
 * - Legacy: if the default admin email exists without the app_metadata role → promote it.
 * - Otherwise → create the admin with the default email/password.
 */
let adminEnsured = false;
async function ensureAdminAccount() {
  if (adminEnsured) return;

  const users = await listAllUsers();
  if (users.some(isAdminUser)) {
    adminEnsured = true;
    return;
  }

  if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured before creating the first admin account");
  }

  const legacy = users.find((u) => u.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL);
  if (legacy) {
    const { error } = await supabase.auth.admin.updateUserById(legacy.id, {
      app_metadata: { ...(legacy.app_metadata || {}), role: "admin" },
      user_metadata: { ...(legacy.user_metadata || {}), role: "admin" },
    });
    if (error) throw error;
    console.log(`🔐 Promoted existing ${DEFAULT_ADMIN_EMAIL} to admin (app_metadata).`);
  } else {
    const { error } = await supabase.auth.admin.createUser({
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      email_confirm: true,
      app_metadata: { role: "admin" },
      user_metadata: { name: DEFAULT_ADMIN_NAME, role: "admin" },
    });
    if (error) throw error;
    console.log(`🔐 Configured administrator created in Supabase Auth: ${DEFAULT_ADMIN_EMAIL}`);
  }

  adminEnsured = true;
}

/**
 * Resolves the authenticated user from the Bearer token.
 */
async function getUserFromRequest(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

/**
 * POST /api/auth/register
 * Creates a new customer in Supabase with instant confirmation
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }

    // Make sure the admin account exists first so nobody can register the admin email.
    try {
      await ensureAdminAccount();
    } catch (e) {
      console.warn("ensureAdminAccount warning:", e.message);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || "").trim() || cleanEmail.split("@")[0];

    // Create user via Supabase Admin API with instant email confirmation (always a customer)
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      app_metadata: { role: "customer" },
      user_metadata: {
        name: cleanName,
        role: "customer",
      },
    });

    if (createError) {
      // If user already exists, give clear feedback
      if (createError.message?.toLowerCase().includes("already registered") || createError.status === 422) {
        return res.status(409).json({ success: false, error: "An account with this email already exists" });
      }
      return res.status(400).json({ success: false, error: createError.message });
    }

    // Sign in immediately to generate access session
    const { data: sessionData, error: signinError } = await createAuthClient().auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signinError) {
      return res.status(201).json({
        success: true,
        user: toPublicUser(userData.user),
        token: null,
        message: "Account created successfully. Please sign in.",
      });
    }

    res.status(201).json({
      success: true,
      user: toPublicUser(sessionData.user),
      token: sessionData.session?.access_token,
      refreshToken: sessionData.session?.refresh_token,
      message: "Registration successful!",
    });
  } catch (err) {
    console.error("Auth register error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to register" });
  }
});

/**
 * POST /api/auth/login
 * Signs in a user using Supabase Auth
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Bootstrap the default admin (only if no admin exists yet)
    try {
      await ensureAdminAccount();
    } catch (e) {
      console.warn("ensureAdminAccount warning:", e.message);
    }

    // Authenticate with Supabase
    const { data, error } = await createAuthClient().auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return res.status(401).json({ success: false, error: error.message || "Invalid email or password" });
    }

    res.json({
      success: true,
      user: toPublicUser(data.user),
      token: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      message: "Signed in successfully",
    });
  } catch (err) {
    console.error("Auth login error:", err);
    res.status(500).json({ success: false, error: err.message || "Authentication failed" });
  }
});

/**
 * GET /api/auth/me
 * Retrieves profile of the currently logged-in user from token
 */
router.get("/me", async (req, res) => {
  try {
    if (!getBearerToken(req)) {
      return res.status(401).json({ success: false, error: "No authentication token provided" });
    }

    try {
      await ensureAdminAccount();
    } catch (e) {
      console.warn("ensureAdminAccount warning:", e.message);
    }

    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid or expired session" });
    }

    res.json({ success: true, user: toPublicUser(user) });
  } catch (err) {
    console.error("Auth /me error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/auth/admin/credentials
 * Lets the logged-in admin change their login email and/or password.
 * Body: { currentPassword, newEmail?, newPassword? }
 */
router.put("/admin/credentials", async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid or expired session" });
    }
    if (!isAdminUser(user)) {
      return res.status(403).json({ success: false, error: "Only administrators can change admin credentials" });
    }

    const { currentPassword, newEmail, newPassword } = req.body || {};

    if (!currentPassword) {
      return res.status(400).json({ success: false, error: "Current password is required" });
    }

    const cleanNewEmail = (newEmail || "").trim().toLowerCase();
    const emailChanged = !!cleanNewEmail && cleanNewEmail !== user.email.toLowerCase();
    const passwordChanged = !!newPassword;

    if (!emailChanged && !passwordChanged) {
      return res.status(400).json({ success: false, error: "Enter a new email or a new password" });
    }
    if (emailChanged && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanNewEmail)) {
      return res.status(400).json({ success: false, error: "Enter a valid email address" });
    }
    if (passwordChanged && newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
    }

    // Verify the current password
    const { error: verifyError } = await createAuthClient().auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) {
      return res.status(401).json({ success: false, error: "Current password is incorrect" });
    }

    const updates = { email_confirm: true };
    if (emailChanged) updates.email = cleanNewEmail;
    if (passwordChanged) updates.password = newPassword;

    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(user.id, updates);
    if (updateError) {
      const msg = updateError.message?.toLowerCase().includes("already")
        ? "That email is already used by another account"
        : updateError.message;
      return res.status(400).json({ success: false, error: msg });
    }

    // Issue a fresh session with the new credentials
    const { data: session } = await createAuthClient().auth.signInWithPassword({
      email: updated.user.email,
      password: passwordChanged ? newPassword : currentPassword,
    });

    res.json({
      success: true,
      user: toPublicUser(updated.user),
      token: session?.session?.access_token || null,
      refreshToken: session?.session?.refresh_token || null,
      message: "Admin credentials updated successfully",
    });
  } catch (err) {
    console.error("Auth admin credentials error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to update credentials" });
  }
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (token) {
      // Optional Supabase signout cleanup
      try {
        await supabase.auth.admin.signOut(token);
      } catch {}
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.json({ success: true, message: "Logged out" });
  }
});

export default router;
