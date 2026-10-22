import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Banner, BannerFormValues } from "@/lib/bannerTypes";
import { isBannerLive } from "@/lib/bannerTypes";
import { getApiBaseUrl } from "@/services/api";

const STORAGE_KEY = "ae_banners_v1";
const AUTH_TOKEN_KEY = "ae_auth_token_v1";

function loadLocalBanners(): Banner[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Banner[]) : [];
  } catch {
    return [];
  }
}

function apiUrl(path: string) {
  const base = getApiBaseUrl();
  const fallbackOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const prefix = base.startsWith("http://") || base.startsWith("https://")
    ? base
    : `${fallbackOrigin}${base.startsWith("/") ? "" : "/"}${base}`;
  return `${prefix}${path}`;
}

function headers() {
  const token = typeof window === "undefined" ? null : localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), { ...options, headers: { ...headers(), ...options?.headers } });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json();
  return data.data as T;
}

export async function uploadBannerImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

export async function listBanners(): Promise<Banner[]> {
  try {
    return await request<Banner[]>("/banners");
  } catch (error) {
    console.warn("Banner API unavailable; using this device's saved banners:", error);
    return loadLocalBanners().sort((a, b) => a.displayOrder - b.displayOrder);
  }
}

export async function createBanner(values: BannerFormValues): Promise<Banner> {
  return request<Banner>("/banners", { method: "POST", body: JSON.stringify(values) });
}

export async function updateBanner(id: string, values: BannerFormValues): Promise<Banner> {
  return request<Banner>(`/banners/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(values),
  });
}

export async function deleteBanner(id: string): Promise<void> {
  await request<void>(`/banners/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getActiveBanners(): Promise<Banner[]> {
  return (await listBanners()).filter(isBannerLive);
}

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

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner created successfully!");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: BannerFormValues }) => updateBanner(id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner updated!");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner deleted.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}