"use client";

import { useState, useEffect, useCallback } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
}

type PushPermissionState = "prompt" | "granted" | "denied" | "unsupported";

export function usePushSubscription() {
  const [permission, setPermission] = useState<PushPermissionState>("prompt");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermission("unsupported"); setLoading(false); return;
    }
    setPermission(Notification.permission as PushPermissionState);
    navigator.serviceWorker.register("/push-sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => { setIsSubscribed(!!sub); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);
      if (result !== "granted") { return false; }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      const json = subscription.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      if (res.ok) { setIsSubscribed(true); return true; }
      return false;
    } catch (err) { console.error("Failed to subscribe to push:", err); return false; }
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) { setIsSubscribed(false); return true; }
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
      setIsSubscribed(false);
      return true;
    } catch (err) { console.error("Failed to unsubscribe from push:", err); return false; }
  }, []);

  return { permission, isSubscribed, loading, subscribe, unsubscribe };
}
