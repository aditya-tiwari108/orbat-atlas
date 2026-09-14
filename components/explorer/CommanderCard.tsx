import { useState } from 'react';
import { UserRound } from 'lucide-react';
import type { Organization, MediaAsset } from '../../data/model';
import media from '../../data/media.json';
const assets = new Map(
  (media as MediaAsset[]).map((asset) => [asset.id, asset]),
);
export default function CommanderCard({
  commander,
  compact = false,
}: {
  commander?: Organization['commander'];
  compact?: boolean;
}) {
  const asset = assets.get(commander?.portraitId || '');
  const [failed, setFailed] = useState(false);
  return (
    <section
      className={
        'commander-card leader-block ' + (compact ? 'commander-compact' : '')
      }
    >
      <div className="leader-photo">
        {asset && !failed ? (
          <img
            src={asset.localPath || asset.url}
            alt={asset.subject}
            onError={() => setFailed(true)}
            decoding="async"
            style={{
              objectFit: asset.fit || 'cover',
              objectPosition: `${(asset.focalPoint?.[0] ?? 0.5) * 100}% ${(asset.focalPoint?.[1] ?? 0.35) * 100}%`,
              transform: `scale(${asset.displayScale || 1})`,
              transformOrigin: `${(asset.focalPoint?.[0] ?? 0.5) * 100}% ${(asset.focalPoint?.[1] ?? 0.35) * 100}%`,
            }}
          />
        ) : (
          <div className="portrait-placeholder">
            <UserRound />
            <span>Portrait unavailable</span>
          </div>
        )}
      </div>
      <div className="commander-caption">
        <span className="eyebrow">
          {commander?.role || 'Commanding officer'}
        </span>
        <h2>{commander?.name || 'Name unavailable'}</h2>
      </div>
    </section>
  );
}
