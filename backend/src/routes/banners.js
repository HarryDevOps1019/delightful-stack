import express from "express";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { supabase } from "../data/supabase.js";

const router = express.Router();

function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || "",
    imageUrl: row.image_url,
    mobileImageUrl: row.mobile_image_url || "",
    ctaText: row.cta_text || "",
    ctaLink: row.cta_link || "",
    altText: row.alt_text || "",
    startDate: row.start_date || "",
    endDate: row.end_date || "",
    active: row.active,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(banner) {
  const title = String(banner.title || "").trim();
  const imageUrl = String(banner.imageUrl || "").trim();
  if (!title || !imageUrl) throw new Error("Title and desktop image are required");
  if (title.length > 100 || imageUrl.length > 12_000_000) throw new Error("Banner content is too large");

  return {
    title,
    subtitle: String(banner.subtitle || "").trim(),
    image_url: imageUrl,
    mobile_image_url: String(banner.mobileImageUrl || "").trim(),
    cta_text: String(banner.ctaText || "").trim(),
    cta_link: String(banner.ctaLink || "").trim(),
    alt_text: String(banner.altText || "").trim(),
    start_date: banner.startDate || null,
    end_date: banner.endDate || null,
    active: Boolean(banner.active),
    display_order: Number.isInteger(banner.displayOrder) ? banner.displayOrder : 0,
    updated_at: new Date().toISOString(),
  };
}

router.get("/", async (_req, res) => {
  try {
    const { data, error } = await supabase.from("banners").select("*").order("display_order");
    if (error) throw error;
    res.json({ success: true, data: data.map(fromRow) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("banners")
      .insert({ id: `banner_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...toRow(req.body) })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data: fromRow(data) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("banners")
      .update(toRow(req.body))
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data: fromRow(data) });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from("banners").delete().eq("id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;