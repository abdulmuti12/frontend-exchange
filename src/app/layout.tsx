import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tukar — Barter Furnitur",
  description: "Tukar furnitur lama Anda dengan koleksi baru, diverifikasi oleh admin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
