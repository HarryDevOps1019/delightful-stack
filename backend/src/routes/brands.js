import express from "express";
import { supabase } from "../data/supabase.js";
import { deleteBrand, findBrand, readBrands, upsertBrand } from "../data/db.js";

const router = express.Router();
const BUCKET = "brand-images";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function ensureBucket() {
  const { data, error: lookupError } = await supabase.storage.getBucket(BUCKET);
  if (data) return;

  if (
    lookupError &&
    /row-level security|unauthorized|permission/i.test(lookupError.message || "")
  ) {
    throw new Error(
      "Brand image storage is not authorized. Configure the backend with the Supabase secret/service-role key, then restart it.",
    );
  }

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_IMAGE_BYTES,
    allowedMimeTypes: Object.keys(IMAGE_TYPES),
  });
  if (error && !error.message?.toLowerCase().includes("already exists")) {
    if (/row-level security|unauthorized|permission/i.test(error.message || "")) {
      throw new Error(
        "Brand image storage is not authorized. Configure the backend with the Supabase secret/service-role key, then restart it.",
      );
    }
    throw new Error(`Could not create brand image bucket: ${error.message}`);
  }
}

function decodeImage(dataUrl) {
  const match =
    /^data:(image\/(?:png|jpeg|webp));base64,([a-z0-9+/=\r\n]+)$/i.exec(
      String(dataUrl || ""),
    );
  if (!match) {
    throw new Error("Brand image must be a PNG, JPEG, or WebP file");
  }

  const mimeType = match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new Error("Brand image must be smaller than 2 MB");
  }

  return { buffer, mimeType, extension: IMAGE_TYPES[mimeType] };
}

async function removeStoredImage(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error)
    console.warn("Could not remove previous brand image:", error.message);
}

router.get("/", async (_req, res) => {
  try {
    res.json({ success: true, data: await readBrands() });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message?.includes("brands")
        ? "Brands table is not ready. Apply backend/src/data/migration.sql in Supabase."
        : err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const slug = slugify(name);
    if (!name || !slug || name.length > 80) {
      return res
        .status(400)
        .json({ success: false, error: "A valid brand name is required" });
    }

    const existing = await findBrand(slug);
    let imageUrl = String(req.body.imageUrl || existing?.imageUrl || "").trim();
    let imagePath = existing?.imagePath || "";

    if (req.body.removeImage) {
      await removeStoredImage(imagePath);
      imageUrl = "";
      imagePath = "";
    } else if (req.body.imageData) {
      const image = decodeImage(req.body.imageData);
      await ensureBucket();
      const nextPath = `${slug}/logo-${Date.now()}.${image.extension}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(nextPath, image.buffer, {
          contentType: image.mimeType,
          cacheControl: "3600",
          upsert: false,
        });
      if (error) throw new Error(`Image upload failed: ${error.message}`);

      await removeStoredImage(imagePath);
      imagePath = nextPath;
      imageUrl = supabase.storage.from(BUCKET).getPublicUrl(nextPath)
        .data.publicUrl;
    } else if (imageUrl && !/^(https?:\/\/|\/)/i.test(imageUrl)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Logo URL must be an HTTP(S) or site-relative URL",
        });
    }

    const saved = await upsertBrand({ slug, name, imageUrl, imagePath });
    res.status(existing ? 200 : 201).json({ success: true, data: saved });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, error: err.message || "Failed to save brand" });
  }
});

router.delete("/:slug", async (req, res) => {
  try {
    const slug = slugify(req.params.slug);
    const existing = await findBrand(slug);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Brand not found" });
    }
    await removeStoredImage(existing.imagePath);
    await deleteBrand(slug);
    res.json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: err.message || "Failed to delete brand" });
  }
});

export default router;
