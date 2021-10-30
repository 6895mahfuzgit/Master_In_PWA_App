if ('serviceWorker' in navigator) {
   navigator.serviceWorker
            .register('/sw.js') //can set scope by ,{scope:''}
            .then(function(){
                console.log('Service Worker has been registered!!!');
            });
}