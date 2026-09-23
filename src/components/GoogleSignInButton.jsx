import { useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { showToast } from './ui/Toast';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Renders the official Google Identity Services button and exchanges the
// returned ID token for our own JWTs via POST /api/auth/google.
// Renders nothing if VITE_GOOGLE_CLIENT_ID is not configured at build time.
export default function GoogleSignInButton({ onSuccess, disabled }) {
  const ref = useRef(null);

  const handleCredential = useCallback(async (response) => {
    const credential = response?.credential;
    if (!credential) return;
    try {
      const result = await api.post('/api/auth/google', { credential }, {}, false);
      if (result?.access_token) {
        // Store tokens the same way the app expects, then let the caller redirect.
        localStorage.setItem('accessToken', result.access_token);
        localStorage.setItem('authToken', result.access_token);
        if (result.refresh_token) localStorage.setItem('refreshToken', result.refresh_token);
        if (result.user) localStorage.setItem('user', JSON.stringify(result.user));
        if (typeof api.setTokens === 'function') {
          try { api.setTokens(result.access_token, result.refresh_token); } catch (_) {}
        }
        showToast('Signed in with Google', 'success');
        onSuccess?.(result.user);
      } else {
        showToast('Google sign-in failed. Please try again.', 'error');
      }
    } catch (e) {
      showToast('Google sign-in failed. Please try again.', 'error');
    }
  }, [onSuccess]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    const init = () => {
      if (!window.google?.accounts?.id || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredential,
      });
      ref.current.replaceChildren();
      window.google.accounts.id.renderButton(ref.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 320,
      });
    };
    if (window.google?.accounts?.id) { init(); return; }
    let script = document.getElementById('gsi-client');
    if (script) { script.addEventListener('load', init); return () => script.removeEventListener('load', init); }
    script = document.createElement('script');
    script.id = 'gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.body.appendChild(script);
  }, [handleCredential]);

  if (!CLIENT_ID) return null;
  return (
    <div className={`w-full flex justify-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div ref={ref} />
    </div>
  );
}
