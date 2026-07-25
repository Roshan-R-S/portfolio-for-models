// ===== SERVICE WORKER REGISTRATION =====
// Enables offline functionality and caches static assets for faster loading

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch(error => {
        console.warn('Service Worker registration failed:', error);
      });
  });
}
