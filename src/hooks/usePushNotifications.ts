import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const usePushNotifications = () => {
  const { user } = useAuth();
  const registered = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || registered.current || !user) return;

    const register = async () => {
      try {
        const permResult = await PushNotifications.requestPermissions();
        if (permResult.receive !== "granted") {
          console.log("Push notification permission denied");
          return;
        }

        await PushNotifications.register();

        PushNotifications.addListener("registration", async (token) => {
          console.log("Push token:", token.value);
          registered.current = true;

          // Store token in database
          const { error } = await supabase.from("push_tokens" as any).upsert(
            {
              user_id: user.id,
              token: token.value,
              platform: Capacitor.getPlatform(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,token" }
          );

          if (error) {
            console.error("Failed to store push token:", error);
          }
        });

        PushNotifications.addListener("registrationError", (error) => {
          console.error("Push registration error:", error);
        });

        PushNotifications.addListener("pushNotificationReceived", (notification) => {
          // Show in-app toast when notification arrives while app is open
          toast(notification.title || "Notification", {
            description: notification.body,
          });
        });

        PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
          console.log("Push action performed:", action);
          // Handle notification tap — could navigate to order, etc.
          const data = action.notification.data;
          if (data?.route) {
            window.location.hash = data.route;
          }
        });
      } catch (err) {
        console.error("Push notification setup error:", err);
      }
    };

    register();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user]);
};
