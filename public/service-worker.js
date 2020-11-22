//updated consts but most code was taked from class activity 18.12
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const iconSizes = ["192","512"];
const iconFiles = iconSizes.map(
  (size) => `/icons/icon-${size}x${size}.png`
);

const staticFilesToPreCache = [
  "/",
  "/index.js",
  "/styles.css",
  "/db.js",
  "/manifest.webmanifest",
].concat(iconFiles);


//Install (special event in the life of a service workeer)
//Takes an event
self.addEventListener("install", function(evt) {
  //don't do anything unil you do the next three lines
  evt.waitUntil(
        //open the cache name or key, if it does not exist, 
    //it will create it
    //then pass in the cache into the cache oobject
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      //then add all the files to cache
      return cache.addAll(staticFilesToPreCache);
    })
  );
//now skip any other waiting
  self.skipWaiting();
});

//now activate
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    //grab the keys from the caches
    //promise based since it's a dot then
    //sends in the key list which are the different cahces
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          //if the key does not euqla the cahse name
          //and it does not equal the data chchae name
          //if you have other cahces, remove them. These are the 
          //only two chaces we care about at this point in time
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch is a function that makes an asynchronous call in the background
self.addEventListener("fetch", function(evt) {
  const {url} = evt.request;
   // cache successful requests to the API
  if (url.includes("/all") || url.includes("/find")) {
    evt.respondWith(
      //open the data cache, pass in the cache for this function
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );
  } else {
    
     // if the request is not for the API, serve static assets using "offline-first" approach.
    evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  }
});