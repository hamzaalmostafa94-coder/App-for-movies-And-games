export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // تسجيل عامل الخدمة عند تحميل الصفحة
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('تم تسجيل عامل الخدمة بنجاح:', registration);
        })
        .catch(error => {
          console.error('خطأ في تسجيل عامل الخدمة:', error);
        });
    });
  }
}