import { lazy, Suspense, useEffect } from 'react';
import { platform } from '../../data/platform';
import Home from './Home';
import './platform.css';
const Explorer = lazy(() => import('../explorer/Explorer'));
const Ranks = lazy(() => import('../ranks/Ranks'));
export default function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const q = new URLSearchParams(window.location.search);
  const atlas =
    path === '/atlas' ||
    (path === '/' && ['org', 'service', 'country'].some((k) => q.has(k)));
  const ranks = path === '/ranks';
  useEffect(() => {
    document.title = `${atlas ? 'ORBAT Atlas' : ranks ? 'Ranks & insignia' : platform.tagline} · ${platform.name}`;
  }, [atlas, ranks]);
  if (!atlas && !ranks && path !== '/')
    return (
      <div className="field-not-found">
        <h1>Page not found</h1>
        <a href="/">Return to {platform.name}</a>
      </div>
    );
  return (
    <Suspense
      fallback={
        <div className="field-loading" role="status">
          Opening {atlas ? 'the atlas' : 'the rank collection'}…
        </div>
      }
    >
      {atlas ? <Explorer /> : ranks ? <Ranks /> : <Home />}
    </Suspense>
  );
}
