export function normalizePhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("62")) return `+${digits}`;
  return `+${digits}`;
}

export function phoneNumberVariants(value: string) {
  const normalized = normalizePhoneNumber(value);
  if (!normalized) return [];

  const internationalDigits = normalized.slice(1);
  return [...new Set([
    value.trim(),
    value.replace(/\D/g, ""),
    normalized,
    internationalDigits,
    `0${internationalDigits.slice(2)}`,
    `00${internationalDigits}`,
  ])];
}

export function looksLikePhoneNumber(value: string) {
  return !value.includes("@") && /\d/.test(value);
}
