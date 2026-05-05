let ymapsPromise: Promise<any> | null = null;

export function loadYmapsScript(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject('SSR');
  if ((window as any).ymaps) return Promise.resolve((window as any).ymaps);
  if (ymapsPromise) return ymapsPromise;

  ymapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
    script.async = true;
    script.onload = () => {
      const ymaps = (window as any).ymaps;
      if (ymaps) {
        ymaps.ready(() => resolve(ymaps));
      } else {
        reject('Yandex Maps not loaded');
      }
    };
    script.onerror = () => {
      ymapsPromise = null; // Reset on error to allow retry
      reject('Failed to load Yandex Maps');
    };
    document.head.appendChild(script);
  });

  return ymapsPromise;
}
