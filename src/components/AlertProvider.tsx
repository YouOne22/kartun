"use client";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export const Alert = withReactContent(Swal);

export async function showError(message: string) {
  await Alert.fire({ icon: "error", title: "Terjadi masalah", text: message });
}

export async function showSuccess(message: string) {
  await Alert.fire({ icon: "success", title: "Berhasil", text: message, timer: 1800, showConfirmButton: false });
}

export async function confirmAction(title: string, text: string) {
  const result = await Alert.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
  });
  return result.isConfirmed;
}

export async function rejectionReason(title: string) {
  const result = await Alert.fire({
    icon: "warning",
    title,
    input: "textarea",
    inputPlaceholder: "Tuliskan alasan penolakan...",
    inputValidator: (value) => !value?.trim() ? "Alasan wajib diisi" : undefined,
    showCancelButton: true,
    confirmButtonText: "Tolak",
    cancelButtonText: "Batal",
  });
  return result.isConfirmed ? (result.value as string).trim() : null;
}
