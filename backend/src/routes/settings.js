import express from "express";
import { readSettings, updateSettings } from "../data/db.js";

const router = express.Router();

// GET /api/settings
router.get("/", async (req, res) => {
  try {
    const settings = await readSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/settings
router.put("/", async (req, res) => {
  try {
    const updated = await updateSettings(req.body);
    res.json({
      success: true,
      data: updated,
      message: "Settings saved successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
