import { useEffect } from 'react';

const FaviconLoader = () => {
  useEffect(() => {
    // Force favicon refresh
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.href = favicon.href.replace(/\?.*$/, '') + '?' + Date.now();
    }
  }, []);

  return null;
};

export default FaviconLoader;