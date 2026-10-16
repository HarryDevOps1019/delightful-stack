import express from "express";
import { readCategories, insertCategory, updateCategoryInDb, deleteCategory, readProducts } from "../data/db.js";

const router = express.Router();

// GET /api/categories (with product counts)
router.get("/", async (req, res) => {
  try {
    const cats = await readCategories();
    const prods = await readProducts();

    const withCounts = cats.map((c) => {
      const count = prods.filter((p) => p.category === c.slug).length;
      return { ...c, productCount: count };
    });

    res.json({ success: true, data: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories
router.post("/", async (req, res) => {
  try {
    const { name, slug, short, image, filterKey } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, error: "Name and slug are required" });
    }

    const cleanSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const newCat = {
      name: String(name).trim(),
      slug: cleanSlug,
      short: short || name.split(" ")[0] || "General",
      image: image || "/assets/imgs/electronic-components.png",
      filterKey: filterKey || "Type",
    };

    const saved = await insertCategory(newCat);

    res.status(201).json({ success: true, data: saved, message: "Category created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/categories/:slug
router.put("/:slug", async (req, res) => {
  try {
    const updated = await updateCategoryInDb(req.params.slug, req.body);
    res.json({ success: true, data: updated, message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/categories/:slug
router.delete("/:slug", async (req, res) => {
  try {
    await deleteCategory(req.params.slug);
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

