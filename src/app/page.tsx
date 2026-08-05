"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Repeat, ArrowRight, ShieldCheck, Users } from "lucide-react";
import { getToken } from "@/lib/api";

export default function LandingPage() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  const userToken = checked ? getToken("user") : null;
  const adminToken = checked ? getToken("admin") : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-paper">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 sm:px-10">
        <div className="flex items-center gap-2">
          <Repeat className="size-6 text-teak" />
          <span className="font-display text-xl font-semibold text-ink">Tukar</span>
        </div>

        <div className="flex flex-1 flex-col items-start justify-center gap-10 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="max-w-xl">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-teak">
              Barter furnitur, tanpa uang tunai
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
              Furnitur lama Anda,
              <br />
              <span className="italic text-teak">tiket masuk</span> ke koleksi baru.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              Ajukan furnitur Anda untuk ditukar dengan barang di katalog. Setiap
              pengajuan diperiksa langsung oleh admin — dari status <em>menunggu</em>{" "}
              hingga <em>disetujui</em> — lengkap dengan ruang obrolan selama
              pemeriksaan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={userToken ? "/user" : "/login"}
                className="inline-flex items-center gap-2 rounded-sm border border-teak bg-teak px-5 py-3 text-sm font-medium text-surface transition-colors hover:bg-teak-deep"
              >
                <Users className="size-4" />
                {userToken ? "Masuk ke akun saya" : "Masuk sebagai pengguna"}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={adminToken ? "/admin" : "/admin/login"}
                className="inline-flex items-center gap-2 rounded-sm border border-ink/30 px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-ink/5"
              >
                <ShieldCheck className="size-4" />
                {adminToken ? "Buka dashboard admin" : "Masuk sebagai admin"}
              </Link>
            </div>
          </div>

          {/* Signature: a stamped swap ticket */}
          <div className="w-full max-w-sm shrink-0 rounded-md border border-line bg-surface shadow-sm">
            <div className="flex items-center justify-between px-5 pt-5">
              <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                Tiket Tukar
              </span>
              <span className="stamp border-moss bg-moss-soft px-2 py-0.5 text-[10px] text-moss">
                Disetujui
              </span>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-6">
              <div>
                <p className="text-[11px] text-ink-soft">Milik Anda</p>
                <p className="font-display text-sm font-medium text-ink">Kursi Kayu Jati</p>
              </div>
              <Repeat className="size-4 text-teak" />
              <div className="text-right">
                <p className="text-[11px] text-ink-soft">Dari katalog</p>
                <p className="font-display text-sm font-medium text-ink">Sofa IKEA Friheten</p>
              </div>
            </div>
            <div className="perforated h-3 border-y border-dashed border-line" />
            <div className="flex items-center justify-between px-5 py-4 font-mono text-[11px] text-ink-soft">
              <span>NO. 00A1B2C3</span>
              <span>14 JUL 2026</span>
            </div>
          </div>
        </div>

        <footer className="border-t border-line pt-6 text-xs text-ink-soft">
          Dashboard pengguna &amp; admin untuk platform barter furnitur Tukar.
        </footer>
      </div>
    </main>
  );
}
