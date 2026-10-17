import express from "express";
import { readOrders, insertOrder, updateOrderStatus } from "../data/db.js";

const router = express.Router();

// GET /api/orders
router.get("/", async (req, res) => {
  try {
    const orders = await readOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders
router.post("/", async (req, res) => {
  try {
    const { customerName, phone, email, items, totalLKR } = req.body;
    if (!customerName || !phone || !items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: "customerName, phone, and items are required" });
    }

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      phone,
      email: email || "",
      items,
      totalLKR: totalLKR || items.reduce((acc, it) => acc + (it.priceLKR || 0) * (it.qty || 1), 0),
      status: "Processing",
      createdAt: new Date().toISOString(),
    };

    const saved = await insertOrder(newOrder);

    res.status(201).json({ success: true, data: saved, message: "Order placed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const updated = await updateOrderStatus(req.params.id, status);

    res.json({ success: true, data: updated, message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
