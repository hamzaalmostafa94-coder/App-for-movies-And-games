// الاستماع لطلبات الشبكة الأساسية لتجاوز فحص المتصفح (PWA Check)
self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
