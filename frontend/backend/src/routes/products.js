import express from "express";
import {
  readProducts,
  writeProducts,
  generate850Products,
  insertProduct,
  updateProduct,
  deleteProduct,
  findProduct,
} from "../data/db.js";

const router = express.Router();

// GET /api/products (with search, category, brand, stock, price, pagination)
router.get("/", async (req, res) => {
  try {
    let items = await readProducts();
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page = 1,
      limit = 25,
    } = req.query;

    if (search) {
      const q = String(search).trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.model?.toLowerCase().includes(q)
      );
    }

    if (category) {
      items = items.filter((p) => p.category === category);
    }

    if (brand) {
      const brandList = String(brand).split(",").map((b) => b.trim().toLowerCase());
      items = items.filter((p) => brandList.includes(p.brand?.toLowerCase()));
    }

    if (minPrice) {
      items = items.filter((p) => p.priceCents >= Number(minPrice) * 100);
    }

    if (maxPrice) {
      items = items.filter((p) => p.priceCents <= Number(maxPrice) * 100);
    }

    if (inStock === "true" || inStock === true) {
      items = items.filter((p) => p.stock > 0);
    }

    // Sort
    if (sort === "price-asc") {
      items.sort((a, b) => a.priceCents - b.priceCents);
    } else if (sort === "price-desc") {
      items.sort((a, b) => b.priceCents - a.priceCents);
    } else if (sort === "name") {
      items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sort === "newest") {
      items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }

    const total = items.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const pages = Math.ceil(total / pageSize);
    const paginated = items.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        pages,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/stats
router.get("/stats", async (req, res) => {
  try {
    const items = await readProducts();
    const inStock = items.filter((p) => p.stock > 5).length;
    const lowStock = items.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = items.filter((p) => p.stock === 0).length;

    res.json({
      success: true,
      stats: {
        total: items.length,
        inStock,
        lowStock,
        outOfStock,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:identifier (by id or slug or sku)
router.get("/:identifier", async (req, res) => {
  try {
    const product = await findProduct(req.params.identifier);

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products (create)
router.post("/", async (req, res) => {
  try {
    const { name, sku, category, priceLKR, stock, brand, model, description, specs } = req.body;
    if (!name || !sku || !category || priceLKR === undefined) {
      return res.status(400).json({ success: false, error: "Missing required fields (name, sku, category, priceLKR)" });
    }

    const cleanSku = String(sku).trim().toUpperCase();

    const newProd = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      slug: `ae-${cleanSku.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: String(name).trim(),
      sku: cleanSku,
      brand: brand || "Generic",
      model: model || "Standard",
      category,
      priceCents: Math.round(Number(priceLKR) * 100),
      compareAtCents: req.body.compareAtLKR ? Math.round(Number(req.body.compareAtLKR) * 100) : undefined,
      stock: Number(stock) || 0,
      images: req.body.images || ["/assets/cat-components.jpg"],
      description: description || "Quality electronic component backed by Asia Electronics warranty.",
      specs: specs || {},
      attributes: req.body.attributes || {},
      featured: Boolean(req.body.featured),
      isNew: true,
      createdAt: new Date().toISOString(),
    };

    const saved = await insertProduct(newProd);

    res.status(201).json({ success: true, data: saved, message: "Product created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id (update)
router.put("/:id", async (req, res) => {
  try {
    const updated = await updateProduct(req.params.id, req.body);
    res.json({ success: true, data: updated, message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/products/seed-800
router.post("/seed-800", async (req, res) => {
  try {
    const fresh = generate850Products();
    await writeProducts(fresh);
    res.json({
      success: true,
      message: `Generated and stored ${fresh.length} SKUs in Supabase!`,
      total: fresh.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
