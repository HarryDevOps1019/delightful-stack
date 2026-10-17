import express from "express";
import { supabase } from "../data/supabase.js";

const router = express.Router();

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
 * POST /api/auth/register
 * Creates a new user in Supabase with instant confirmation
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

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || "").trim() || cleanEmail.split("@")[0];
    const role = cleanEmail === "admin@gmail.com" ? "admin" : "customer";

    // Create user via Supabase Admin API with instant email confirmation
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: cleanName,
        role,
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
    const { data: sessionData, error: signinError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (signinError) {
      return res.status(201).json({
        success: true,
        user: {
          id: userData.user.id,
          email: userData.user.email,
          name: cleanName,
          role,
        },
        token: null,
        message: "Account created successfully. Please sign in.",
      });
    }

    res.status(201).json({
      success: true,
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.user_metadata?.name || cleanName,
        role: sessionData.user.user_metadata?.role || role,
      },
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

    // Auto-provision default admin if admin@gmail.com is used for the first time
    if (cleanEmail === "admin@gmail.com" && (password === "123456" || password === "12345")) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const adminExists = existingUsers?.users?.some((u) => u.email?.toLowerCase() === "admin@gmail.com");

      if (!adminExists) {
        await supabase.auth.admin.createUser({
          email: "admin@gmail.com",
          password: "123456",
          email_confirm: true,
          user_metadata: { name: "Store Administrator", role: "admin" },
        });
      }
    }


    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return res.status(401).json({ success: false, error: error.message || "Invalid email or password" });
    }

    const user = data.user;
    const role = user.email?.toLowerCase() === "admin@gmail.com"
      ? "admin"
      : (user.user_metadata?.role || "customer");

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split("@")[0],
        role,
      },
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
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: "No authentication token provided" });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: "Invalid or expired session" });
    }

    const role = user.email?.toLowerCase() === "admin@gmail.com"
      ? "admin"
      : (user.user_metadata?.role || "customer");

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split("@")[0],
        role,
      },
    });
  } catch (err) {
    console.error("Auth /me error:", err);
    res.status(500).json({ success: false, error: err.message });
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
