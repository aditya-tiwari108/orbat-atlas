import { lazy, Suspense, useEffect } from 'react';
import { platform } from '../../data/platform';
import Home from './Home';
import './platform.css';
const Explorer = lazy(() => import('../explorer/Explorer'));
const Symbols = lazy(() => import('../symbols/Symbols'));
const Armoury = lazy(() => import('../armoury/Armoury'));
const Ranks = lazy(() => import('../ranks/Ranks'));
export default function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const q = new URLSearchParams(window.location.search);
  const atlas =
    path === '/atlas' ||
    (path === '/' && ['org', 'service', 'country'].some((k) => q.has(k)));
  const ranks = path === '/ranks';
  const symbols = path === '/symbols';
  const armoury = path === '/armoury';
  useEffect(() => {
    document.title = `${atlas ? 'ORBAT Atlas' : ranks ? 'Ranks & insignia' : symbols ? 'NATO symbols' : armoury ? 'Arms & cartridges' : platform.tagline} · ${platform.name}`;
  }, [atlas, ranks, symbols, armoury]);
  if (!atlas && !ranks && !symbols && !armoury && path !== '/')
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
          Opening{' '}
          {atlas
            ? 'the atlas'
            : symbols
              ? 'the symbol collection'
              : armoury
                ? 'the equipment collection'
                : 'the rank collection'}
          …
        </div>
      }
    >
      {atlas ? (
        <Explorer />
      ) : ranks ? (
        <Ranks />
      ) : armoury ? (
        <Armoury />
      ) : symbols ? (
        <Symbols />
      ) : (
        <Home />
      )}
    </Suspense>
  );
}
