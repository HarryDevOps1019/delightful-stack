import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  fetchSettingsApi,
  updateSettingsApi,
  type ApiSettings,
  DEFAULT_SETTINGS,
} from "@/services/api";
import { cleanWhatsAppNumber } from "@/lib/config";

interface SettingsContextValue {
  settings: ApiSettings;
  whatsappDigits: string;
  updateSettings: (newSettings: Partial<ApiSettings>) => Promise<boolean>;
  refreshSettings: () => Promise<void>;
  buildWhatsAppUrl: (message: string) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ApiSettings>(DEFAULT_SETTINGS);

  const load = async () => {
    try {
      const data = await fetchSettingsApi();
      if (data) setSettings(data);
    } catch (err) {
      console.warn("Failed to load settings from API, using defaults:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const whatsappDigits = cleanWhatsAppNumber(settings.whatsappNumber);

  const update = async (updates: Partial<ApiSettings>) => {
    const res = await updateSettingsApi(updates);
    if (res) {
      setSettings(res);
      return true;
    }
    return false;
  };

  const buildWhatsAppUrl = (message: string) => {
    return `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        whatsappDigits,
        updateSettings: update,
        refreshSettings: load,
        buildWhatsAppUrl,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    const whatsappDigits = cleanWhatsAppNumber(DEFAULT_SETTINGS.whatsappNumber);
    return {
      settings: DEFAULT_SETTINGS,
      whatsappDigits,
      updateSettings: async () => false,
      refreshSettings: async () => {},
      buildWhatsAppUrl: (message: string) =>
        `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`,
    };
  }
  return ctx;
}
