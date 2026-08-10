"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import { apiFor, extractErrorMessage, setToken, setStoredProfile } from "@/lib/api";

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

type UseGoogleProps = {
  onLogin: (accessToken: string, user: Record<string, unknown>) => void;
  onError: (message: string) => void;
};

function useGoogle({ onLogin, onError }: UseGoogleProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleGoogleCallback = useCallback(async (response: { credential: string }) => {
    const idToken = response.credential;
    if (!idToken) {
      onError("Google authentication failed.");
      return;
    }
    try {
      const { data } = await apiFor("user").post("/auth/user/google/callback", {
        id_token: idToken,
      });
      setToken("user", data.data.access_token);
      setStoredProfile("user", data.data.user);
      toast.success("Login berhasil.");
      onLogin(data.data.access_token, data.data.user);
    } catch (err) {
      const msg = extractErrorMessage(err, "Google login failed.");
      toast.error(msg);
      onError(msg);
    }
  }, [onLogin, onError]);

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
          text: "signin_with",
          shape: "rectangular",
        });
      } catch (e) {
        console.error("Google button render error:", e);
      }
    }
  }, [scriptLoaded, buttonRef]);

  return { buttonRef, scriptLoaded };
}

export function GoogleAuthButton({ onLogin, onError }: {
  onLogin: (accessToken: string, user: Record<string, unknown>) => void;
  onError: (message: string) => void;
}) {
  const { buttonRef } = useGoogle({ onLogin, onError });
  return <div ref={buttonRef} className="w-full" />;
}
