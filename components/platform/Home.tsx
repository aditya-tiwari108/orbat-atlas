import {
  ArrowUpRight,
  ArrowRight,
  Compass,
  Layers3,
  ScanLine,
} from 'lucide-react';
import { platform } from '../../data/platform';
import Header from './Header';
import { rankAssets } from '../../data/ranks/model';
export default function Home() {
  const previews = [
    'Generic-Navy-8.svg',
    'Colonel_of_the_Indian_Army.svg',
    'Indian_IAF_OF-5.svg',
  ];
  return (
    <div className="field-site">
      <a className="skip-link" href="#field-main">
        Skip to content
      </a>
      <Header />
      <main id="field-main" className="field-home">
        <div className="home-intro">
          <div>
            <p className="field-kicker">THE DEFENCE REFERENCE</p>
            <h1>{platform.tagline}</h1>
          </div>
          <p>
            For the curious. For those preparing.
            <br />
            Explore how forces are organized, and learn the insignia behind the
            ranks and symbols.
          </p>
        </div>
        <section
          className="field-collections"
          aria-label="Explore the collection"
        >
          <a
            aria-label="Open ORBAT Atlas"
            href="/atlas"
            className="collection-card atlas-collection"
          >
            <div className="collection-art map-art" aria-hidden="true">
              <div className="map-grid" />
              <img src="/geography/india-context.svg" alt="" />
              <span className="art-caption">
                ORGANIZATIONS / GEOGRAPHY / CONNECTIONS
              </span>
            </div>
            <div className="collection-copy">
              <span className="collection-index">
                <Compass size={16} /> 01 / EXPLORE
              </span>
              <h2>
                ORBAT Atlas <ArrowUpRight />
              </h2>
              <p>
                See the bigger picture. Commands, formations and the connections
                between them, on a map.
              </p>
              <span className="collection-link">
                Open the atlas <ArrowRight size={16} />
              </span>
            </div>
          </a>
          <a
            aria-label="Explore ranks and insignia"
            href="/ranks"
            className="collection-card ranks-collection"
          >
            <div className="collection-art ranks-art" aria-hidden="true">
              <div className="rank-specimen">
                {previews.map((f, i) => (
                  <div key={f}>
                    <small>{['NAVY', 'ARMY', 'AIR FORCE'][i]}</small>
                    {rankAssets[f] && <img src={rankAssets[f].path} alt="" />}
                    <span>{['CAPTAIN', 'COLONEL', 'GROUP CAPTAIN'][i]}</span>
                  </div>
                ))}
              </div>
              <span className="art-caption">THREE SERVICES. ONE LEVEL.</span>
            </div>
            <div className="collection-copy">
              <span className="collection-index">
                <Layers3 size={16} /> 02 / COMPARE
              </span>
              <h2>
                Ranks &amp; insignia <ArrowUpRight />
              </h2>
              <p>
                Learn to read the uniform. Compare ranks across services, one
                insignia at a time.
              </p>
              <span className="collection-link">
                Explore the ranks <ArrowRight size={16} />
              </span>
            </div>
          </a>
          <a
            aria-label="Explore NATO symbols"
            href="/symbols"
            className="collection-card symbols-collection"
          >
            <div className="collection-art symbols-art" aria-hidden="true">
              <div className="home-symbols">
                <img src="/symbol-previews/infantry.svg" alt="" />
                <img src="/symbol-previews/corps.svg" alt="" />
                <img src="/symbol-previews/armour.svg" alt="" />
              </div>
              <span className="art-caption">IDENTITY / FUNCTION / ECHELON</span>
            </div>
            <div className="collection-copy">
              <span className="collection-index">
                <ScanLine size={16} /> 03 / DECODE
              </span>
              <h2>
                NATO symbols <ArrowUpRight />
              </h2>
              <p>
                Read the language of military maps. Explore formations, build a
                symbol, and test what you know.
              </p>
              <span className="collection-link">
                Explore the symbols <ArrowRight size={16} />
              </span>
            </div>
          </a>
        </section>
        <div className="home-footnote">
          <span>INDIA / PAKISTAN / CHINA</span>
          <p>
            A growing collection of tools for defence enthusiasts and aspirants.
          </p>
          <span>
            MORE TO COME <ArrowRight size={14} />
          </span>
        </div>
      </main>
      <footer className="field-footer">
        <span>{platform.name} / An independent reference</span>
        <span>Built for understanding.</span>
      </footer>
    </div>
  );
}
