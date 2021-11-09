importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');


var STATIC_CACHE_VERSION_NAME = 'static-v26';
var DYNAMIC_CACHE_VERSION_NAME = 'dynamic-v3';

self.addEventListener('install', function (event) {
  console.log('Installing Service Worker ...', event);
  event.respondWith(
    caches.open(STATIC_CACHE_VERSION_NAME)
      .then(
        function (cache) {
          cache.addAll([
            '/',
            '/index.html',
            '/offline.html',
            '/src/js/app.js',
            '/src/js/feed.js',
            '/src/js/idb.js',
            '/src/js/utility.js',
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
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== STATIC_CACHE_VERSION_NAME && key !== DYNAMIC_CACHE_VERSION_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}
self.addEventListener('fetch', function (event) {

  var url = 'https://pwagrambd-default-rtdb.firebaseio.com/posts';
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(fetch(event.request)
      .then(function (res) {

        var copyResponse = res.clone();
        clearAllData('posts').then(function () {

          console.log('data cleared');
          return copyResponse.json()
        })
          .then(function (data) {
            for (var key in data) {
              writeData('posts', data[key]);
            }
          })
        return res;
      })

    );


  } else if (isInArray(event.request.url, STATIC_CACHE_VERSION_NAME)) {
    event.respondWith(
      caches.match(event.request)
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function (res) {
                return caches.open(DYNAMIC_CACHE_VERSION_NAME)
                  .then(function (cache) {
                    // trimCache(CACHE_DYNAMIC_NAME, 3);
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(function (err) {
                return caches.open(DYNAMIC_CACHE_VERSION_NAME)
                  .then(function (cache) {
                    if (event.request.headers.get('accept').includes('text/html')) {
                      return cache.match('/offline.html');
                    }
                  });
              });
          }
        })
    );
  }
});


self.addEventListener('sync', function(event) {
  console.log('[Service Worker] Background syncing', event);
  if (event.tag === 'sync-new-posts') {
    console.log('[Service Worker] Syncing new Posts');
    event.waitUntil(
      readAllData('sync-posts')
        .then(function(data) {
          for (var dt of data) {
            fetch('https://pwagrambd-default-rtdb.firebaseio.com/posts.json', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                id: dt.id,
                title: dt.title,
                location: dt.location,
                image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-99adf.appspot.com/o/sf-boat.jpg?alt=media&token=19f4770c-fc8c-4882-92f1-62000ff06f16'
              })
            })
              .then(function(res) {
                console.log('Sent data', res);
                if (res.ok) {
                  deleteItemFromData('sync-posts', dt.id); // Isn't working correctly!
                }
              })
              .catch(function(err) {
                console.log('Error while sending data', err);
              });
          }

        })
    );
  }
});
