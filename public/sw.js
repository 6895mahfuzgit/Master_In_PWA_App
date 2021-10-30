var VERSION = '1'

self.addEventListener('install', function (event) {
    console.log('Installing Service Worker ...', event);
});


self.addEventListener('activate', function (event) {
    console.log('Activating Service Worker ...', event);
    return self.clients.claim();
});



self.addEventListener('fetch', function (event) {
    console.log('Fetching ...', event);
    return event.respondWith(event.request);
});
