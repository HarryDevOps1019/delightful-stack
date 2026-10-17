import { supabase } from "../data/supabase.js";
import { generate850Products, writeProducts, writeCategories } from "../data/db.js";

const defaultCategories = [
  { slug: "components", name: "Electronic Components & Repair Parts", short: "Components", image: "/assets/imgs/electronic-components.png", filterKey: "Component Type" },
  { slug: "audio", name: "Audio & Speakers", short: "Audio", image: "/assets/cat-audio.jpg", filterKey: "Connectivity" },
  { slug: "lighting", name: "Lighting", short: "Lighting", image: "/assets/cat-lighting.jpg", filterKey: "Power" },
  { slug: "mobile", name: "Mobile Parts & Accessories", short: "Mobile Parts", image: "/assets/cat-mobile.jpg", filterKey: "Compatibility" },
  { slug: "tv", name: "TVs & Projectors", short: "TVs", image: "/assets/cat-tv.jpg", filterKey: "Screen Size" },
];

async function seed() {
  console.log("🌱 Checking Supabase connection and tables...");

  const { error: testError } = await supabase.from("products").select("id").limit(1);
  if (testError) {
    console.error("❌ Table check failed:", testError.message);
    console.log("\n========================================================");
    console.log("⚠️  The tables do not exist in your Supabase project yet!");
    console.log("👉 1. Open: https://supabase.com/dashboard/project/btikfhdgjhppabhbvaeo/sql/new");
    console.log("👉 2. Paste the SQL from 'src/data/migration.sql'");
    console.log("👉 3. Click 'Run' (green button)");
    console.log("👉 4. Run 'npm run seed' again");
    console.log("========================================================\n");
    process.exitCode = 1;
    return;
  }

  console.log("✅ Tables verified! Seeding categories...");
  await writeCategories(defaultCategories);
  console.log("✅ Categories seeded successfully.");

  console.log("📦 Generating 850 realistic electronics products...");
  const products = generate850Products();
  console.log(`📦 Seeding ${products.length} products to Supabase (batching in chunks of 500)...`);
  await writeProducts(products);
  console.log("🎉 Seeding complete! 850 products now live in Supabase.");
}

seed().catch((err) => {
  console.error("Error during seeding:", err);
  process.exitCode = 1;
});

