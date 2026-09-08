import { useState } from "react";

export const usePWAInstall = () => {
  const [isIOS] = useState(() => {
    if (typeof window === "undefined") return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  });

  const [isStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  });

  return {
    isIOS,
    isStandalone,
    isInstallable: isIOS && !isStandalone,
  };
};