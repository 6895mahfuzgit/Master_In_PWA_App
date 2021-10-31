var STATIC_CACHE_VERSION_NAME='static-v1';
var DYNAMIC_CACHE_VERSION_NAME='dynamic-v1';

self.addEventListener('install', function (event) {
    console.log('Installing Service Worker ...', event);
    event.respondWith(
        caches.open(STATIC_CACHE_VERSION_NAME)
            .then(
                function (cache) {
                    cache.addAll([
                        '/',
                        '/index.html',
                        '/src/js/app.js',
                        '/src/js/feed.js',
                        '/src/js/promise.js',
                        '/src/js/fetch.js',
                        '/src/js/material.min.js',
                        '/src/css/app.css',
                        '/src/css/feed.css',
                        '/src/images/main-image.jpg',
                        'https://fonts.googleapis.com/css?family=Roboto:400,700',
                        'https://fonts.googleapis.com/icon?family=Material+Icons',
                        'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                    ]);
                }));
});

self.addEventListener('activate', function (event) {
    console.log('Activating Service Worker ...', event);
    event.waitUntil(
      caches.keys()
            .then(function(keyList){
               return Promise.all(keyList.map(function(key){
                    if(key!==STATIC_CACHE_VERSION_NAME && key!==DYNAMIC_CACHE_VERSION_NAME){
                        console.log('Removed Cache ',key);
                        return caches.delete(key)
                    }
               }))
            })
    );    
    return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    console.log('Fetching ...', event);
    //return event.respondWith(event.request);
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) {
                return response;
            } else {
                return fetch(event.request)
                         .then(function(res){
                             caches.open(DYNAMIC_CACHE_VERSION_NAME)
                             .then(function(cache){
                                 cache.put(event.request.url,res.clone());
                                 return res;
                             })
                         }).catch(function(error){


                         });
            }
        }));

});
