"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Fitur", href: "#fitur" },
  { label: "Kegiatan", href: "#kegiatan" },
  { label: "Tentang", href: "#tentang" },
  { label: "Kontak", href: "#kontak" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E6EFEA] bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Logo Karang Taruna TUNAS HARAPAN"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight text-[#06251F]">
              TUNAS HARAPAN
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.2em] text-[#008F68]">
              KARANG TARUNA
            </span>
          </span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#52656B] transition-colors hover:bg-[#EAF7F0] hover:text-[#06251F]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-3 inline-flex items-center gap-1.5 rounded-xl bg-[#008F68] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#007A59]"
          >
            Masuk ke Aplikasi
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Tombol hamburger */}
        <button
          type="button"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-[#06251F] hover:bg-[#EAF7F0] md:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div className="border-t border-[#E6EFEA] bg-white px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-[#52656B] hover:bg-[#EAF7F0] hover:text-[#06251F]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={
                  process.env.NEXT_PUBLIC_GFORM_REGISTER_URL ??
                  "https://docs.google.com/forms/d/e/1FAIpQLSfmjLS5032T-arEmvWZLEcdeuVWePsJgKm3PStHiljthanisA/viewform?usp=publish-editor"
                }
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#008F68] px-4 py-3 text-sm font-semibold text-white"
            >
              Daftar ke Aplikasi
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
