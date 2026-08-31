"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/layout/AuthCard";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { apiFor, extractErrorMessage, fieldErrors, setToken, setStoredProfile } from "@/lib/api";

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
      toast.success("Account created successfully.");
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
      eyebrow="New User"
      title="Create account"
      description="Register to start offering furniture and swapping."
      maxWidth="max-w-4xl"
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
          <GoogleAuthButton
            onLogin={(token, user) => {
              setToken("user", token as string);
              setStoredProfile("user", user);
              toast.success("Google registration successful.");
              router.push("/user");
            }}
            onError={(msg) => setError(msg)}
          />
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
              label="WhatsApp Number"
              placeholder="0812 3456 7890"
              autoComplete="tel"
              hint="Used for WhatsApp contact by admin"
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
            {error && <p className="text-sm font-display text-rust">{error}</p>}
            <Button type="submit" loading={loading} className="mt-2 w-full">
              Sign Up
            </Button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/login" className="text-sm text-ink-soft hover:text-ink">
              Already have an account?{" "}
              <span className="font-display text-teak hover:underline">Log in</span>
            </Link>
            <div className="mt-2">
              <Link href="/forgot-password" className="text-xs text-ink-soft hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthCard>
  );
}
