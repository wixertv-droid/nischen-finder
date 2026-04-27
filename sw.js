// sw.js - Background Service Worker für die App-Installation

self.addEventListener('install', (e) => {
    console.log('[System] Service Worker installiert.');
    self.skipWaiting(); // Zwingt das System, das Update sofort zu übernehmen
});

self.addEventListener('activate', (e) => {
    console.log('[System] Service Worker aktiviert.');
});

self.addEventListener('fetch', (e) => {
    // Dieser leere Fetch-Listener reicht aus, um die Installations-Regeln von Chrome zu erfüllen
    return;
});
