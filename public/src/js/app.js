if ('serviceWorker' in navigator) {
   navigator.serviceWorker
            .register('/service-worker.js') //can set scope by ,{scope:''}
            .then(function(){
                console.log('Service Worker has been registered!!!');
            });
}