import { useState } from 'react';
import type { Guide, GuideCategory } from '../types/public';
import { RoughBox, ScribbleTitle, Icon } from '../components/Sketchy';

// ---------------------------------------------------------------------------
// Minimal markdown renderer — handles bold, italic, headings, lists, paragraphs
// No external dep; safe for hand-authored seed content only.
// ---------------------------------------------------------------------------
function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const formatted = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    if (formatted.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h2 style="font-family:var(--pen);font-size:17px;margin:18px 0 6px">${formatted.slice(3)}</h2>`);
    } else if (formatted.startsWith('# ')) {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<h1 style="font-family:var(--pen);font-size:20px;margin:20px 0 8px">${formatted.slice(2)}</h1>`);
    } else if (formatted.startsWith('- ')) {
      if (!inList) { out.push('<ul style="margin:6px 0 6px 18px;padding:0">'); inList = true; }
      out.push(`<li style="margin:3px 0">${formatted.slice(2)}</li>`);
    } else if (formatted.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push('<p style="margin:0 0 8px"></p>');
    } else {
      if (inList) { out.push('</ul>'); inList = false; }
      out.push(`<p style="margin:0 0 8px">${formatted}</p>`);
    }
  }

  if (inList) out.push('</ul>');
  return out.join('');
}

// ---------------------------------------------------------------------------
// GuideCard (internal)
// ---------------------------------------------------------------------------
interface GuideCardProps {
  guide: Guide;
  idx: number;
  onClick: () => void;
}

function GuideCard({ guide, idx, onClick }: GuideCardProps) {
  return (
    <RoughBox
      width="100%"
      height={170}
      fill="var(--paper)"
      seed={idx * 7 + 5}
      jitter={1.1}
      onClick={onClick}
      style={{ cursor: 'pointer', minWidth: 0 }}
    >
      <div style={{ padding: '10px 12px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Category chip */}
        <div style={{
          alignSelf: 'flex-start',
          padding: '2px 8px',
          background: 'var(--terra-soft)',
          border: '1.2px solid var(--line)',
          borderRadius: 14,
          fontFamily: 'var(--label)',
          fontSize: 10,
          marginBottom: 6,
        }}>
          {guide.category}
        </div>

        {/* Title — two-line clamp */}
        <div style={{
          fontFamily: 'var(--pen)',
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.25,
          color: 'var(--ink)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: 4,
        }}>
          {guide.title}
        </div>

        {/* Summary — two-line clamp */}
        {guide.summary && (
          <div style={{
            fontFamily: 'var(--note)',
            fontSize: 12,
            color: 'var(--ink-soft)',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {guide.summary}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Footer: reading time */}
        {guide.readingTimeMin != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--label)', fontSize: 10, color: 'var(--ink-faint)' }}>
            <Icon kind="book" size={12} color="var(--ink-faint)" />
            <span>{guide.readingTimeMin} min</span>
          </div>
        )}
      </div>
    </RoughBox>
  );
}

// ---------------------------------------------------------------------------
// Guides (exported)
// ---------------------------------------------------------------------------
const ALL_CATEGORIES: GuideCategory[] = [
  'poda', 'diseño', 'bancales', 'plagas', 'riego', 'compost', 'setos',
];

interface GuidesProps {
  guides: Guide[];
  onSelectGuide: (slug: string) => void;
}

export function Guides({ guides, onSelectGuide }: GuidesProps) {
  const [category, setCategory] = useState<GuideCategory | 'todas'>('todas');

  const filtered = category === 'todas'
    ? guides
    : guides.filter(g => g.category === category);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <ScribbleTitle size={28}>Guías</ScribbleTitle>
        <div style={{ fontFamily: 'var(--note)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
          {guides.length} {guides.length === 1 ? 'guía' : 'guías'} disponibles
        </div>
      </div>

      {/* Category filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['todas', ...ALL_CATEGORIES] as const).map(cat => (
          <div
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '4px 12px',
              background: category === cat ? 'var(--terra-soft)' : 'var(--paper)',
              border: '1.4px solid var(--line)',
              borderRadius: 14,
              fontFamily: 'var(--label)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {filtered.map((g, i) => (
            <GuideCard key={g.id} guide={g} idx={i} onClick={() => onSelectGuide(g.slug)} />
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 32 }}>
          <RoughBox width="100%" height={100} fill="var(--paper)" seed={42} jitter={1.0}>
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
              <span style={{ fontFamily: 'var(--note)', fontSize: 14, color: 'var(--ink-soft)', textAlign: 'center' }}>
                Guías en camino — pronto añadiremos contenido sobre poda, plagas y más.
              </span>
            </div>
          </RoughBox>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GuideDetail (exported)
// ---------------------------------------------------------------------------
interface GuideDetailProps {
  guides: Guide[];
  slug: string;
  onBack: () => void;
  onSelectPlant: (slug: string) => void;
}

export function GuideDetail({ guides, slug, onBack, onSelectPlant }: GuideDetailProps) {
  const guide = guides.find(g => g.slug === slug);

  if (!guide) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'var(--note)', fontSize: 14, color: 'var(--ink-faint)' }}>
        Guía no encontrada.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div onClick={onBack} style={{ cursor: 'pointer' }}>
          <Icon kind="arrow-l" size={22} color="var(--ink-soft)" />
        </div>
        <ScribbleTitle size={24}>{guide.title}</ScribbleTitle>
      </div>

      {/* Category chip */}
      <div style={{
        display: 'inline-block',
        padding: '3px 10px',
        background: 'var(--terra-soft)',
        border: '1.2px solid var(--line)',
        borderRadius: 14,
        fontFamily: 'var(--label)',
        fontSize: 11,
        marginBottom: 16,
      }}>
        {guide.category}
      </div>

      {/* Hero image */}
      {guide.heroImage && (
        <img
          src={guide.heroImage}
          alt={guide.title}
          style={{ width: '100%', maxHeight: 220, objectFit: 'cover', border: '1.4px solid var(--line)', display: 'block', marginBottom: 20 }}
        />
      )}

      {/* Content */}
      <div
        style={{ fontFamily: 'var(--note)', fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(guide.contentMd) }}
      />

      {/* Related plants */}
      {guide.relatedPlantSlugs.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: 'var(--pen)', fontSize: 16, fontWeight: 600, marginBottom: 10 }}>
            Plantas relacionadas
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {guide.relatedPlantSlugs.map(s => (
              <div
                key={s}
                onClick={() => onSelectPlant(s)}
                style={{
                  padding: '4px 12px',
                  background: 'var(--green-soft)',
                  border: '1.2px solid var(--line)',
                  borderRadius: 14,
                  fontFamily: 'var(--label)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
