import { useEffect } from 'react';

// Tawk.to live-chat widget. Injects the embed script once on mount and renders
// its own floating launcher (bottom-right), replacing the old in-app chat.
const TAWK_SRC = 'https://embed.tawk.to/6ab3ad09d624f73448dbe0f0/1k36tnrg8';

export default function TawkToWidget() {
  useEffect(() => {
    // Avoid double-injecting (e.g. React strict-mode / re-mounts)
    if (window.__tawkLoaded) return;
    window.__tawkLoaded = true;
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    // Lift the launcher above sticky bottom bars (e.g. "Proceed to buy") on mobile
    window.Tawk_API.customStyle = {
      visibility: {
        desktop: { position: 'br', xOffset: 20, yOffset: 20 },
        mobile: { position: 'br', xOffset: 10, yOffset: 90 },
      },
    };

    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = TAWK_SRC;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.body.appendChild(s1);
  }, []);

  return null;
}
