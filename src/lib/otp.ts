import crypto from "crypto";

export function generateOtpCode() {
  return String(crypto.randomInt(100000, 999999));
}
