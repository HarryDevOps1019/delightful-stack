/**
 * Official Asia Electronics & Cellular (AEC) Business Configuration
 */

export const OFFICIAL_AEC_WHATSAPP_DISPLAY = "+94 74 106 6017";
export const OFFICIAL_AEC_EMAIL = "aecpvt60@gmail.com";
export const OFFICIAL_AEC_PHONE = "+94 74 106 6017";

/**
 * Strips all non-digit characters from a phone number string for WhatsApp URLs
 * e.g. "+94 74 106 6017" -> "94741066017"
 */
export function cleanWhatsAppNumber(phone?: string): string {
  if (!phone) return "94741066017";
  const cleaned = phone.replace(/\D/g, "");
  return cleaned || "94741066017";
}

/**
 * Standard business WhatsApp number used across the storefront (digits only)
 */
export const BUSINESS_WHATSAPP_NUMBER = cleanWhatsAppNumber(OFFICIAL_AEC_WHATSAPP_DISPLAY);
