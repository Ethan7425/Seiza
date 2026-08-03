// ---- Push notifications (client side) ----
// The public VAPID key is safe to embed — only the matching private
// key (held by the GitHub Action that actually sends pushes) is
// secret. See scripts/send-nudges.mjs for the sending side.
const VAPID_PUBLIC_KEY = "BAEW-v85iDg1mJ19dZ8P_a_4-emk9_dmo-VWsSimDOjxDycABzyf7n5xLiY_HKIm8M2tqCA67xecY4dtbvKXGCE";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

function pushSupported() {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

// Asks for permission, subscribes with the browser's push service, and
// returns a plain object ready to save onto the profile. Throws with a
// message suitable for showing directly to the user.
async function subscribeToPush() {
  if (!pushSupported()) {
    throw new Error("Push isn't supported here — on iPhone, make sure Seiza is added to your Home Screen and opened from that icon, not from Safari.");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was denied.");
  }
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  return subscription.toJSON();
}

async function unsubscribeFromPush() {
  if (!pushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();
}
