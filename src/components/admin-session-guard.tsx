"use client";

import { useEffect, useRef } from "react";

export function AdminSessionGuard() {
  const shouldReloadOnFocus = useRef(false);

  useEffect(() => {
    const logout = () => {
      shouldReloadOnFocus.current = true;

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/admin/logout");
        return;
      }

      fetch("/api/admin/logout", { method: "POST", keepalive: true }).catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        logout();
        return;
      }

      if (shouldReloadOnFocus.current) {
        window.location.replace("/admin");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
