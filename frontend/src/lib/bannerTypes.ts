import { z } from "zod";

// ─── Zod Schema ───────────────────────────────────────────────────────────────

export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  subtitle: z.string().max(200).optional(),
  imageUrl: z.string().url("Must be a valid URL").min(1, "Desktop image is required"),
  mobileImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  ctaText: z.string().max(50).optional(),
  ctaLink: z.string().max(300).optional(),
  altText: z.string().max(200).optional(),
  startDate: z.string().optional(), // ISO date string (YYYY-MM-DD)
  endDate: z.string().optional(),
  active: z.boolean(),
  displayOrder: z.number().int().min(0).max(999),
});

export type BannerFormValues = z.infer<typeof bannerSchema>;

// ─── Core Banner Type ─────────────────────────────────────────────────────────

export interface Banner extends BannerFormValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Timezone helper (Asia/Colombo) ──────────────────────────────────────────

export function nowInColombo(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" }));
}

/**
 * Returns true if a banner should be displayed right now.
 * Considers active flag + start/end dates in Asia/Colombo timezone.
 */
export function isBannerLive(banner: Banner): boolean {
  if (!banner.active) return false;
  const now = nowInColombo();

  if (banner.startDate) {
    const start = new Date(banner.startDate + "T00:00:00");
    if (now < start) return false;
  }
  if (banner.endDate) {
    // End of day on endDate
    const end = new Date(banner.endDate + "T23:59:59");
    if (now > end) return false;
  }
  return true;
}
