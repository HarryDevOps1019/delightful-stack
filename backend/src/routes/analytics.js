import express from "express";
import { readProducts, readOrders, readCategories } from "../data/db.js";

const router = express.Router();

// GET /api/analytics
router.get("/", async (req, res) => {
  try {
    const products = await readProducts();
    const orders = await readOrders();
    const categories = await readCategories();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalLKR || 0), 0);
    const completedOrders = orders.filter((o) => o.status === "Delivered").length;
    const processingOrders = orders.filter((o) => o.status === "Processing").length;

    // Revenue by category breakdown
    const categoryBreakdown = categories.map((c) => {
      const prodsInCat = products.filter((p) => p.category === c.slug);
      const estRevenue = prodsInCat.slice(0, 15).reduce((acc, p) => acc + (p.priceCents / 100), 0);
      return {
        category: c.name,
        slug: c.slug,
        productCount: prodsInCat.length,
        estimatedRevenueLKR: Math.round(estRevenue),
      };
    });

    res.json({
      success: true,
      data: {
        totalRevenueLKR: totalRevenue,
        totalOrders: orders.length,
        completedOrders,
        processingOrders,
        activeProducts: products.length,
        inStockProducts: products.filter((p) => p.stock > 0).length,
        lowStockAlerts: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
        categoryBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
