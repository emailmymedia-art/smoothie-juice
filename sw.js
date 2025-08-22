/* sw.js — Superhuman Smoothie/Juice Notifications
   Works on GitHub Pages under /smoothie-juice/ path.
   - Handles install/activate
   - Shows clickable notifications (triggered from page via reg.showNotification)
   - On click: focuses/open the page and scrolls to "Today"
*/

const SW_VERSION = '1';

// Install immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Take control of existing clients as soon as we activate
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Focus an existing tab if open, otherwise open a new one
async function focusOrOpen(targetUrl) {
  const allClients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });

  // Try to focus a client already at the target URL (or same path)
  for (const client of allClients) {
    try {
      const same =
        client.url === targetUrl ||
        client.url.startsWith(targetUrl) ||
        (targetUrl.endsWith('/smoothie-juice/') && client.url.includes('/smoothie-juice/'));
      if (same) {
        await client.focus();
        client.postMessage({ type: 'SCROLL_TO_TODAY' });
        return client;
      }
    } catch (_) {}
  }

  // Otherwise open a new one
  const newClient = await self.clients.openWindow(targetUrl);
  if (newClient) {
    // Give the page a moment to load, then ask it to scroll
    setTimeout(() => {
      try { newClient.postMessage({ type: 'SCROLL_TO_TODAY' }); } catch (_) {}
    }, 800);
  }
  return newClient;
}

// When the user clicks a notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // URL was passed from the page when the notification was created
  // Fallback to the site root on GitHub Pages.
  const fallback = '/smoothie-juice/';
  const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || fallback;

  event.waitUntil(focusOrOpen(targetUrl));
});

// (Optional) If you ever add push messages later, this is where you'd show a notification.
// self.addEventListener('push', (event) => {
//   const data = event.data ? event.data.json() : { title: 'Reminder', body: 'Tap to view today', url: '/smoothie-juice/#today' };
//   event.waitUntil(self.registration.showNotification(data.title, {
//     body: data.body,
//     data: { url: data.url || '/smoothie-juice/#today' },
//     tag: 'superhuman-push',
//     renotify: false
//   }));
// });

