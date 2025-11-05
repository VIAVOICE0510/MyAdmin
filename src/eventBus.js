// src/eventBus.js

// یک شی ساده برای نگه داشتن لیسنرها
const listeners = {};

// ثبت listener روی یک event
export const subscribe = (event, callback) => {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);

  // return تابع لغو اشتراک
  return () => {
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  };
};

// انتشار event
export const emit = (event, data) => {
  if (listeners[event]) {
    listeners[event].forEach(cb => cb(data));
  }
};
