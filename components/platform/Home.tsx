import {
  ArrowUpRight,
  ArrowRight,
  Compass,
  Layers3,
  ScanLine,
  Box,
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
            ranks, symbols and equipment.
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
          <a
            aria-label="Explore arms and cartridges"
            href="/armoury"
            className="collection-card armoury-collection"
          >
            <div className="collection-art armoury-art" aria-hidden="true">
              <svg viewBox="0 0 460 200">
                <defs>
                  <linearGradient id="cartridge-brass">
                    <stop stopColor="#806e4c" />
                    <stop offset=".45" stopColor="#d9c59c" />
                    <stop offset="1" stopColor="#867450" />
                  </linearGradient>
                </defs>
                <g
                  fill="url(#cartridge-brass)"
                  stroke="#cfbb8e"
                  strokeWidth=".7"
                >
                  <path d="M101 159V134H113V159Z" />
                  <path d="M168 159V91L174 80V71H186V80L192 91V159Z" />
                  <path d="M248 159V72L255 59V46H269V59L276 72V159Z" />
                  <path d="M334 159V61L342 47V31H356V47L364 61V159Z" />
                </g>
                <g fill="#ab7755">
                  <path d="M101 134Q101 121 107 119Q113 121 113 134Z" />
                  <path d="M174 71Q174 52 180 41Q186 52 186 71Z" />
                  <path d="M255 46Q257 22 262 12Q267 22 269 46Z" />
                  <path d="M342 31Q343 13 349 0Q355 13 356 31Z" />
                </g>
                <path d="M62 164H407" stroke="#789192" strokeOpacity=".5" />
                <g
                  fill="#b7c6c3"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  <text x="107" y="184">
                    .22 LR
                  </text>
                  <text x="180" y="184">
                    5.56
                  </text>
                  <text x="262" y="184">
                    7.62
                  </text>
                  <text x="349" y="184">
                    7.62R
                  </text>
                </g>
              </svg>
              <span className="art-caption">FORM / FUNCTION / CARTRIDGES</span>
            </div>
            <div className="collection-copy">
              <span className="collection-index">
                <Box size={16} /> 04 / INSPECT
              </span>
              <h2>
                Arms &amp; cartridges <ArrowUpRight />
              </h2>
              <p>
                Get closer to the equipment. Explore weapons in 3D, compare
                their specifications, and understand the cartridges.
              </p>
              <span className="collection-link">
                Open the armoury <ArrowRight size={16} />
              </span>
            </div>
          </a>
        </section>
        <div className="home-footnote">
          <span>A GROWING GLOBAL COLLECTION</span>
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
