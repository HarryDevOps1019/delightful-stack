import { supabase } from "../data/supabase.js";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_NAME = "Store Administrator";

async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  console.log(`🔐 Setting up Admin in Supabase Auth (${ADMIN_EMAIL})...`);

  try {
    // 1. Check if admin user already exists in Supabase
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error("❌ Failed to list users from Supabase:", listError.message);
      process.exit(1);
    }

    const existingAdmin = userList?.users?.find(
      (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    );

    if (existingAdmin) {
      console.log(`👤 Admin found with ID: ${existingAdmin.id}. Updating password and metadata...`);
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        existingAdmin.id,
        {
          password: ADMIN_PASSWORD,
          email_confirm: true,
          app_metadata: { ...(existingAdmin.app_metadata || {}), role: "admin" },
          user_metadata: {
            name: ADMIN_NAME,
            role: "admin",
          },
        }
      );

      if (updateError) {
        console.error("❌ Failed to update admin user:", updateError.message);
        process.exit(1);
      }

      console.log("✅ Admin user successfully updated in Supabase!");
      console.log("-----------------------------------------");
      console.log(`Email:    ${ADMIN_EMAIL}`);
      console.log(`Role:     admin`);
      console.log("-----------------------------------------");
    } else {
      console.log("➕ Creating new Admin user in Supabase Auth...");
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        app_metadata: { role: "admin" },
        user_metadata: {
          name: ADMIN_NAME,
          role: "admin",
        },
      });

      if (createError) {
        console.error("❌ Failed to create admin user:", createError.message);
        process.exit(1);
      }

      console.log("🎉 Admin user successfully created in Supabase!");
      console.log("-----------------------------------------");
      console.log(`ID:       ${newUser.user.id}`);
      console.log(`Email:    ${ADMIN_EMAIL}`);
      console.log(`Role:     admin`);
      console.log("-----------------------------------------");
    }

    // 2. Verify sign-in with the new credentials
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (loginError) {
      console.warn("⚠️ Verification sign-in warning:", loginError.message);
    } else {
      console.log("✅ Supabase sign-in verification verified successfully!");
      console.log("Supabase sign-in verification succeeded.");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  }
}

seedAdmin();
