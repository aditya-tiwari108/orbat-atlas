import { readFileSync, writeFileSync } from 'node:fs';
const assets = JSON.parse(readFileSync('data/media.json', 'utf8'));
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
const rows = assets
  .map(
    (a) =>
      `<article><img src="${escape(a.localPath)}" alt="${escape(a.subject)}" loading="lazy"><div><h2>${escape(a.subject)}</h2><p>${escape(a.credit)}</p><p>${escape(a.rights)}</p><a href="${escape(a.sourceUrl)}">Image source</a> · <a href="${escape(a.rightsUrl)}">Reuse terms</a><p class="note">${escape(a.identityNote || 'Photograph from the named official appointment release.')} Display framing may crop the original photograph.</p></div></article>`,
  )
  .join('\n');
writeFileSync(
  'public/image-credits.html',
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portrait credits · ORBAT Atlas</title><style>body{background:#172328;color:#e1e5e5;font:16px/1.6 system-ui;margin:0 auto;max-width:850px;padding:32px 24px}a{color:#d8b779}h1{font-weight:500}h2{font-size:20px;margin:0}article{display:flex;gap:24px;border-top:1px solid #3c4b52;padding:28px 0}img{width:110px;height:140px;object-fit:contain}p{margin:8px 0}.note{color:#acb7bb;font-size:13px}@media(max-width:500px){article{display:block}img{margin-bottom:12px}}</style><a href="/">← Back to the atlas</a><h1>Portrait credits</h1><p>These photographs identify the officers shown in the atlas. They may predate the current appointment. Their providers do not endorse this application.</p>${rows}</html>`,
);
