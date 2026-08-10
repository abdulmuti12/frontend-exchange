"use client";

import { FormEvent, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/layout/AuthCard";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiFor, extractErrorMessage, fieldErrors, setToken, setStoredProfile } from "@/lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            container: HTMLElement | null,
            options: { theme?: string; size?: string; text?: string; shape?: string }
          ) => void;
          prompt: (callback: (notification: { getPromptMomentNotification: () => string }) => void) => void;
          disableAutoSelect: () => void;
          storeCredential: (credentials: { id: string; password: string }, callback: () => void) => void;
          cancel: () => void;
          onGoogleLoad: (callback: () => void) => void;
        };
      };
    };
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleGoogleCallback = useCallback(async (response: { credential: string }) => {
    const idToken = response.credential;
    if (!idToken) {
      toast.error("Google authentication failed.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await apiFor("user").post("/auth/user/google/callback", {
        id_token: idToken,
      });
      setToken("user", data.data.access_token);
      setStoredProfile("user", data.data.user);
      toast.success("Google registration successful.");
      router.push("/user");
    } catch (err) {
      const msg = extractErrorMessage(err, "Google registration failed.");
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // script cleanup handled by browser
    };
  }, []);

  useEffect(() => {
    if (scriptLoaded && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch (e) {
        console.error("Google SDK init error:", e);
      }
    }
  }, [scriptLoaded, handleGoogleCallback]);

  useEffect(() => {
    if (scriptLoaded && buttonRef.current && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "signup_with",
          shape: "rectangular",
        });
      } catch (e) {
        console.error("Google button render error:", e);
      }
    }
  }, [scriptLoaded, buttonRef]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});
    try {
      const { data } = await apiFor("user").post("/auth/user/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number || undefined,
        address: form.address || undefined,
      });
      setToken("user", data.data.access_token);
      setStoredProfile("user", data.data.user);
      toast.success("Akun berhasil dibuat.");
      router.push("/user");
    } catch (err) {
      setErrors(fieldErrors(err));
      setError(extractErrorMessage(err, "Registrasi gagal, periksa data Anda."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Pengguna Baru"
      title="Buat akun"
      description="Daftar untuk mulai menawarkan furnitur dan menukarnya."
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-line">
        {/* Left side - Google registration */}
        <div className="flex flex-col items-center justify-center py-8 md:py-0 md:px-8 md:w-1/2">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-teak">
            Register with Google
          </p>
          <p className="mb-6 text-sm text-ink-soft text-center">
            Quick access without password
          </p>
          <div ref={buttonRef} className="w-full max-w-xs"></div>
          <div className="mt-8 flex items-center w-full max-w-xs">
            <div className="flex-1 h-px bg-line"></div>
            <span className="mx-3 text-xs text-ink-soft font-mono">OR</span>
            <div className="flex-1 h-px bg-line"></div>
          </div>
        </div>

        {/* Right side - Email registration form */}
        <div className="md:px-8 md:py-8 md:w-1/2">
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-teak">
            Sign up with email
          </p>
          <p className="mb-5 text-sm text-ink-soft">
            Create your account below — fill in your details to get started.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <TextField
              label="Name"
              placeholder="Full Name"
              required
              autoComplete="name"
              value={form.name}
              error={errors.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <TextField
              label="Email Address"
              placeholder="you@example.com"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              error={errors.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password}
              error={errors.password}
              onChange={(e) => update("password", e.target.value)}
            />
            <TextField
              label="Phone Number"
              placeholder="+62 812 3456 7890"
              autoComplete="tel"
              value={form.phone_number}
              error={errors.phone_number}
              onChange={(e) => update("phone_number", e.target.value)}
            />
            <TextField
              label="Address"
              placeholder="Your address"
              autoComplete="street-address"
              value={form.address}
              error={errors.address}
              onChange={(e) => update("address", e.target.value)}
            />
            {error && <p className="text-sm font-medium text-rust">{error}</p>}
            <Button type="submit" loading={loading} className="mt-2 w-full">
              Sign Up
            </Button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/login" className="text-sm text-ink-soft hover:text-ink">
              Already have an account?{" "}
              <span className="font-medium text-teak hover:underline">Log in</span>
            </Link>
          </div>
        </div>
      </div>
    </AuthCard>
  );
}
