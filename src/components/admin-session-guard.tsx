"use client";

import { useEffect } from "react";

function requestLogout() {
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/admin/logout");
    return;
  }

  fetch("/api/admin/logout", { method: "POST", keepalive: true }).catch(() => {});
}

export function AdminSessionGuard() {
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest("a");

      if (!link?.href) {
        return;
      }

      const url = new URL(link.href);

      if (url.origin === window.location.origin && !url.pathname.startsWith("/admin")) {
        requestLogout();
      }
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return null;
}
