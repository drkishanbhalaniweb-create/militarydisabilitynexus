export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '1290149076362130';

export const trackMetaPageView = () => {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }

  window.fbq('track', 'PageView');
};

export const trackMetaEvent = (eventName, parameters = {}) => {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return;
  }

  window.fbq('track', eventName, parameters);
};
