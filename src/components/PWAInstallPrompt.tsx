import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed recently
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return; // 7 days
    }

    // Check if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // iOS detection
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isiOS);

    if (isiOS) {
      // Show iOS instructions after a delay
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / desktop — listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-[72px] left-0 right-0 z-50 px-3 animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-lg mx-auto bg-primary text-primary-foreground rounded-xl p-3 shadow-lg flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center shrink-0">
          {isIOS ? (
            <Share className="h-5 w-5" />
          ) : (
            <Download className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-tight">Install SaloneMakitSL</p>
          <p className="text-[10px] opacity-80 leading-tight mt-0.5">
            {isIOS
              ? "Tap Share → 'Add to Home Screen'"
              : "Get the app for faster shopping & offline access"}
          </p>
        </div>
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="shrink-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full hover:bg-primary-foreground/10 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
