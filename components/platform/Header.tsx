import { BookOpen, ArrowUpRight } from 'lucide-react';
import { platform } from '../../data/platform';
export default function Header({ section }: { section?: 'ranks' | 'symbols' }) {
  return (
    <header className="field-header">
      <a className="field-brand" href="/" aria-label={`${platform.name} home`}>
        <BookOpen size={23} strokeWidth={1.5} />
        <span>
          {platform.name}
          <i>FIELD NOTES / OPEN REFERENCE</i>
        </span>
      </a>
      <nav aria-label="Platform">
        <a href="/atlas">
          ORBAT Atlas <ArrowUpRight size={13} />
        </a>
        <a
          href="/ranks"
          aria-current={section === 'ranks' ? 'page' : undefined}
        >
          Ranks &amp; insignia
        </a>
        <a
          href="/symbols"
          aria-current={section === 'symbols' ? 'page' : undefined}
        >
          NATO symbols
        </a>
      </nav>
    </header>
  );
}
