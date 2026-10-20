/**
 * Banner service — simulates Supabase Storage + PostgreSQL.
 *
 * In a real project:
 *   - `uploadBannerImage`  → supabase.storage.from("banners").upload(...)
 *   - `createBanner`       → supabase.from("banners").insert(...)
 *   - `updateBanner`       → supabase.from("banners").update(...).eq("id", id)
 *   - `deleteBanner`       → supabase.from("banners").delete().eq("id", id)
 *   - `listBanners`        → supabase.from("banners").select("*").order("display_order")
 *   - `getActiveBanners`   → supabase.from("banners").select("*").eq("active", true)
 *
 * For now data persists in localStorage so it survives page reloads in dev.
 */

import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Banner, BannerFormValues } from "@/lib/bannerTypes";
import { isBannerLive } from "@/lib/bannerTypes";

const STORAGE_KEY = "ae_banners_v1";

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadAll(): Banner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Banner[]) : [];
  } catch {
    return [];
  }
}

function saveAll(banners: Banner[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
}

function generateId(): string {
  return `banner_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Simulated image upload ───────────────────────────────────────────────────
// In production: upload to Supabase Storage and return the public URL.
// Here we create an object URL from the File so the image renders correctly.

export async function uploadBannerImage(file: File): Promise<string> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 600));
  // Return a persistent data URL so it survives the current session
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function listBanners(): Promise<Banner[]> {
  await new Promise((r) => setTimeout(r, 200));
  return loadAll().sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function createBanner(values: BannerFormValues): Promise<Banner> {
  await new Promise((r) => setTimeout(r, 300));
  const banner: Banner = {
    ...values,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const all = loadAll();
  all.push(banner);
  saveAll(all);
  return banner;
}

export async function updateBanner(id: string, values: BannerFormValues): Promise<Banner> {
  await new Promise((r) => setTimeout(r, 300));
  const all = loadAll();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error(`Banner ${id} not found`);
  const updated: Banner = {
    ...all[idx],
    ...values,
    id,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  saveAll(all);
  return updated;
}

export async function deleteBanner(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  const all = loadAll().filter((b) => b.id !== id);
  saveAll(all);
}

export async function getActiveBanners(): Promise<Banner[]> {
  await new Promise((r) => setTimeout(r, 200));
  return loadAll()
    .filter(isBannerLive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

// ─── TanStack Query options ───────────────────────────────────────────────────

export const bannersQuery = queryOptions({
  queryKey: ["banners"],
  queryFn: listBanners,
  staleTime: 5_000,
});

export const activeBannersQuery = queryOptions({
  queryKey: ["banners", "active"],
  queryFn: getActiveBanners,
  staleTime: 30_000,
  refetchOnWindowFocus: true,
});

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useCreateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner created successfully!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: BannerFormValues }) =>
      updateBanner(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner updated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner deleted.");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
