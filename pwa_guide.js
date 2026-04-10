// ============================================================
// 1. public/manifest.json — Cấu hình PWA (đặt trong /public)
// ============================================================
// {
//   "name": "ClinicalGuide — Phác đồ Y tế",
//   "short_name": "ClinicalGuide",
//   "start_url": "/",
//   "display": "standalone",
//   "background_color": "#0f1117",
//   "theme_color": "#3b82f6",
//   "orientation": "any",
//   "icons": [
//     { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
//     { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
//   ]
// }

// ============================================================
// 2. public/sw.js — Service Worker với chiến lược Cache-First
// ============================================================

const CACHE_NAME = "clinicalguide-v3.2";

// Tài nguyên cần cache khi cài app (App Shell)
const APP_SHELL = [
  "/",
  "/index.html",
  "/static/js/main.chunk.js",
  "/static/css/main.chunk.css",
  "/icons/icon-192.png",
  "/manifest.json",
];

// API endpoints cần cache dữ liệu phác đồ
const API_BASE = "/api/guidelines";

// --- Install: cache App Shell ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// --- Activate: xóa cache cũ ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// --- Fetch: Chiến lược theo loại request ---
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Chiến lược 1 — Network First (cho API phác đồ)
  // Ưu tiên dữ liệu mới nhất, fallback về cache nếu offline
  if (url.pathname.startsWith(API_BASE)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Chiến lược 2 — Cache First (cho App Shell & static assets)
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// --- Background Sync: Đồng bộ khi có mạng trở lại ---
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-edits") {
    event.waitUntil(syncPendingEdits());
  }
});

async function syncPendingEdits() {
  // Đọc từ IndexedDB các chỉnh sửa đang chờ
  const db = await openDB();
  const pendingEdits = await db.getAll("pendingEdits");
  for (const edit of pendingEdits) {
    try {
      await fetch(`${API_BASE}/${edit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit.data),
      });
      await db.delete("pendingEdits", edit.id);
    } catch (e) {
      console.warn("Sync failed, will retry:", e);
    }
  }
}

// ============================================================
// 3. src/hooks/useOfflineStorage.js — Hook lưu phác đồ offline
// ============================================================

import { openDB as idbOpen } from "idb"; // npm install idb

const DB_NAME = "ClinicalGuideDB";
const DB_VERSION = 1;

async function getDB() {
  return idbOpen(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore("guidelines", { keyPath: "id" });
      db.createObjectStore("pendingEdits", { keyPath: "id" });
    },
  });
}

export function useOfflineStorage() {
  // Lưu toàn bộ phác đồ vào IndexedDB
  const saveGuideline = async (guideline) => {
    const db = await getDB();
    await db.put("guidelines", { ...guideline, savedAt: new Date().toISOString() });
  };

  // Đọc phác đồ từ IndexedDB (dùng khi offline)
  const getGuideline = async (id) => {
    const db = await getDB();
    return db.get("guidelines", id);
  };

  // Đánh dấu chỉnh sửa để sync sau khi có mạng
  const queueEdit = async (id, data) => {
    const db = await getDB();
    await db.put("pendingEdits", { id, data, timestamp: Date.now() });
    // Đăng ký Background Sync
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register("sync-edits");
    }
  };

  return { saveGuideline, getGuideline, queueEdit };
}

// ============================================================
// 4. src/index.js — Đăng ký Service Worker
// ============================================================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      console.log("SW registered:", reg.scope);

      // Thông báo khi có phiên bản mới
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // Hiện toast: "Có phiên bản phác đồ mới — Tải lại để cập nhật"
            showUpdateToast();
          }
        });
      });
    } catch (err) {
      console.error("SW registration failed:", err);
    }
  });
}

// ============================================================
// 5. Kiểm tra trạng thái mạng trong component
// ============================================================

function useNetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}

// Dùng trong component:
// const online = useNetworkStatus();
// {!online && <OfflineBanner />}  // Hiển thị banner "Đang dùng offline"
