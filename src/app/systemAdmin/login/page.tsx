"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/layout/AuthCard";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { apiFor, extractErrorMessage, setToken, setStoredProfile } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiFor("admin").post("/auth/systemAdmin/login", { email, password });
      setToken("admin", data.data.access_token);
      setStoredProfile("admin", data.data.admin);
      toast.success(data.message ?? "Logged in successfully.");
      router.push("/systemAdmin");
    } catch (err) {
      setError(extractErrorMessage(err, "Incorrect email or password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Admin"
      title="Sign in"
      description="Manage catalog, verify transactions, and monitor platform statistics."
      footer={
        <Link href="/login" className="text-xs text-ink-soft hover:underline">
          ← Sign in as user
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-rust">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2 w-full">
          Sign in as admin
        </Button>
      </form>
    </AuthCard>
  );
}
