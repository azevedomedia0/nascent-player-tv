import { StrictMode, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { NascentLanding } from './components/landing/NascentLanding';
import './index.css';
import './components/landing/nascent-landing.css';

const PLAYER_KEY = 'nascent_enter_player';

function shouldStartInPlayer(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('player') === '1' || params.get('app') === '1') return true;
  if (window.location.hash === '#app' || window.location.hash === '#player') return true;
  try {
    return sessionStorage.getItem(PLAYER_KEY) === '1';
  } catch {
    return false;
  }
}

function Root() {
  const [mode, setMode] = useState<'landing' | 'player'>(() =>
    shouldStartInPlayer() ? 'player' : 'landing'
  );

  const enterPlayer = useCallback(() => {
    try {
      sessionStorage.setItem(PLAYER_KEY, '1');
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href);
    url.searchParams.set('player', '1');
    window.history.replaceState({}, '', url.toString());
    setMode('player');
    window.scrollTo(0, 0);
  }, []);

  if (mode === 'landing') {
    return <NascentLanding onEnterPlayer={enterPlayer} />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
