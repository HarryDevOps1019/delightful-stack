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

// POST /api/orders  (Quotation request)
router.post("/", async (req, res) => {
  try {
    const { customerName, phone, email, address, city, items, notes } = req.body;
    if (!customerName || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "customerName, phone, and items (array) are required",
      });
    }

    // Generate a unique AEC order ID
    const uid = `AEC-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    const calculatedTotal = items.reduce((sum, item) => sum + (Number(item.priceLKR) || 0) * (Number(item.qty) || 1), 0);
    const totalLKR = req.body.totalLKR !== undefined ? Number(req.body.totalLKR) : calculatedTotal;

    const newOrder = {
      id: uid,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: (email || "").trim(),
      address: (address || "").trim(),
      city: (city || "").trim(),
      notes: (notes || "").trim(),
      items,
      totalLKR,
      status: "Quotation Requested",
      createdAt: new Date().toISOString(),
    };

    const saved = await insertOrder(newOrder);

    res.status(201).json({
      success: true,
      data: saved,
      message: "Quotation request saved successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "Quotation Requested",
      "Quotation Sent",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updated = await updateOrderStatus(req.params.id, status);

    res.json({
      success: true,
      data: updated,
      message: `Order status updated to ${status}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
