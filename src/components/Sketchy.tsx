import React from 'react';
import type { PlantKind } from '../types';

// Deterministic pseudo-random for stable wobble
function seeded(seed: number) {
  let s = (seed | 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 10000) / 10000;
  };
}

export function roughRectPath(x: number, y: number, w: number, h: number, seed = 7, jitter = 1.2) {
  const r = seeded(seed);
  const j = () => (r() - 0.5) * jitter * 2;
  const p1 = [x + j(), y + j()];
  const p2 = [x + w + j(), y + j()];
  const p3 = [x + w + j(), y + h + j()];
  const p4 = [x + j(), y + h + j()];
  return `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} L ${p4[0]} ${p4[1]} Z`;
}

export function roughCirclePath(cx: number, cy: number, rad: number, seed = 11, jitter = 0.8) {
  const r = seeded(seed);
  const N = 22;
  const pts: number[][] = [];
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const rr = rad + (r() - 0.5) * jitter * 2;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return 'M ' + pts.map(p => p.join(' ')).join(' L ') + ' Z';
}

// ── RoughBox ──────────────────────────────────────────────────────────────────
interface RoughBoxProps {
  width: number | string;
  height: number | string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  seed?: number;
  jitter?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  dashed?: boolean;
  double?: boolean;
  onClick?: () => void;
  className?: string;
}

export function RoughBox({ width, height, fill = 'transparent', stroke, strokeWidth = 1.6, seed = 7, jitter = 1.2, children, style, dashed, double: dbl, onClick, className }: RoughBoxProps) {
  const w = typeof width === 'number' ? width : 300;
  const h = typeof height === 'number' ? height : 100;
  return (
    <div onClick={onClick} className={className} style={{ position: 'relative', width, height, cursor: onClick ? 'pointer' : undefined, ...style }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
        {fill !== 'transparent' && (
          <path d={roughRectPath(2, 2, w - 4, h - 4, seed, jitter * 0.6)} fill={fill} stroke="none" />
        )}
        <path d={roughRectPath(2, 2, w - 4, h - 4, seed, jitter)}
          fill="none" stroke={stroke || 'var(--line)'} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={dashed ? '5 4' : undefined} />
        {dbl && (
          <path d={roughRectPath(4, 4, w - 8, h - 8, seed + 11, jitter * 0.7)}
            fill="none" stroke={stroke || 'var(--line)'} strokeWidth={strokeWidth * 0.7}
            strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
        )}
      </svg>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>{children}</div>
    </div>
  );
}

// ── PlantGlyph ────────────────────────────────────────────────────────────────
export function PlantGlyph({ kind = 'leaf', size = 18, color = 'var(--line)' }: { kind: PlantKind | string; size?: number; color?: string }) {
  const s = size;
  const stroke: React.SVGAttributes<SVGElement> = { stroke: color, strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'tomato':
      return <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="14" r="7" {...stroke} fill="rgba(184,98,58,0.35)" /><path d="M8 7 L12 10 L16 7 M12 10 L12 7" {...stroke} /></svg>;
    case 'lettuce':
      return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 16 Q4 10 9 8 Q12 4 15 8 Q20 10 19 16 Z" {...stroke} fill="rgba(106,138,58,0.25)" /><path d="M9 14 Q12 10 15 14 M12 8 L12 16" {...stroke} /></svg>;
    case 'carrot':
      return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 8 L8 20 L12 22 L16 20 Z" {...stroke} fill="rgba(184,98,58,0.4)" /><path d="M9 8 Q10 4 12 5 Q14 4 15 8" {...stroke} /><path d="M10 12 L11 13 M13 14 L14 15" {...stroke} /></svg>;
    case 'pepper':
      return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M10 8 Q8 14 11 19 Q14 20 15 16 Q17 12 14 8 Z" {...stroke} fill="rgba(232,197,71,0.35)" /><path d="M11 8 Q12 5 14 6" {...stroke} /></svg>;
    case 'onion':
      return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M7 15 Q7 9 12 9 Q17 9 17 15 Q17 20 12 20 Q7 20 7 15 Z" {...stroke} fill="rgba(214,199,224,0.4)" /><path d="M10 5 L12 9 L14 5 M12 9 L12 19" {...stroke} /></svg>;
    case 'bean':
      return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M6 18 Q4 12 10 6 M10 6 Q14 8 13 13 M13 13 Q12 18 6 18" {...stroke} fill="rgba(106,138,58,0.25)" /></svg>;
    case 'flower':
      return <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="10" r="2.5" {...stroke} /><circle cx="12" cy="6" r="2" {...stroke} fill="rgba(232,197,71,0.5)" /><circle cx="8" cy="9" r="2" {...stroke} fill="rgba(232,197,71,0.5)" /><circle cx="16" cy="9" r="2" {...stroke} fill="rgba(232,197,71,0.5)" /><circle cx="9" cy="13" r="2" {...stroke} fill="rgba(232,197,71,0.5)" /><circle cx="15" cy="13" r="2" {...stroke} fill="rgba(232,197,71,0.5)" /><path d="M12 14 L12 22" {...stroke} /></svg>;
    case 'herb':
      return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 22 L12 8" {...stroke} /><path d="M12 16 Q8 14 7 10 Q11 11 12 14 M12 12 Q16 10 17 6 Q13 7 12 10" {...stroke} fill="rgba(106,138,58,0.25)" /></svg>;
    default:
      return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 19 Q5 8 18 5 Q20 14 9 19 Z" {...stroke} fill="rgba(106,138,58,0.3)" /><path d="M9 17 Q12 12 17 7" {...stroke} /></svg>;
  }
}

// ── Icon ──────────────────────────────────────────────────────────────────────
export function Icon({ kind, size = 22, color = 'var(--line)' }: { kind: string; size?: number; color?: string }) {
  const s = size;
  const stroke: React.SVGAttributes<SVGElement> = { stroke: color, strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'plus':    return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 5 L12 19 M5 12 L19 12" {...stroke} /></svg>;
    case 'search':  return <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="11" cy="11" r="6" {...stroke} /><path d="M16 16 L20 20" {...stroke} /></svg>;
    case 'calendar':return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 7 L19 7 L19 19 L5 19 Z M5 11 L19 11 M9 5 L9 9 M15 5 L15 9" {...stroke} /></svg>;
    case 'home':    return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M4 12 L12 5 L20 12 M6 11 L6 20 L18 20 L18 11" {...stroke} /></svg>;
    case 'book':    return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 5 L11 6 L11 19 L5 18 Z M11 6 L17 5 L19 6 L19 18 L17 19 L11 19" {...stroke} /></svg>;
    case 'list':    return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 7 L19 7 M5 12 L19 12 M5 17 L14 17" {...stroke} /></svg>;
    case 'sun':     return <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" {...stroke} /><path d="M12 3 L12 5 M12 19 L12 21 M3 12 L5 12 M19 12 L21 12 M5.5 5.5 L7 7 M17 17 L18.5 18.5 M5.5 18.5 L7 17 M17 7 L18.5 5.5" {...stroke} /></svg>;
    case 'drop':    return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 4 Q6 12 6 16 Q6 20 12 20 Q18 20 18 16 Q18 12 12 4 Z" {...stroke} /></svg>;
    case 'camera':  return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 9 L9 9 L11 7 L13 7 L15 9 L19 9 L19 18 L5 18 Z" {...stroke} /><circle cx="12" cy="13.5" r="3" {...stroke} /></svg>;
    case 'star':    return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 4 L14 10 L20 10.5 L15.5 14.5 L17 20 L12 17 L7 20 L8.5 14.5 L4 10.5 L10 10 Z" {...stroke} /></svg>;
    case 'gear':    return <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" {...stroke} /><path d="M12 4 L12 6 M12 18 L12 20 M4 12 L6 12 M18 12 L20 12 M6 6 L7.5 7.5 M16.5 16.5 L18 18 M6 18 L7.5 16.5 M16.5 7.5 L18 6" {...stroke} /></svg>;
    case 'arrow-r': return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 12 L19 12 M14 7 L19 12 L14 17" {...stroke} /></svg>;
    case 'arrow-l': return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M19 12 L5 12 M10 7 L5 12 L10 17" {...stroke} /></svg>;
    case 'pencil':  return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 19 L7 14 L16 5 L19 8 L10 17 Z M14 7 L17 10" {...stroke} /></svg>;
    case 'check':   return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 13 L10 18 L19 7" {...stroke} /></svg>;
    case 'trash':   return <svg width={s} height={s} viewBox="0 0 24 24"><path d="M5 7 L19 7 M9 7 L9 5 L15 5 L15 7 M7 7 L8 19 L16 19 L17 7 M11 11 L11 16 M13 11 L13 16" {...stroke} /></svg>;
    case 'leaf':    return <PlantGlyph kind="leaf" size={s} color={color} />;
    default:        return <svg width={s} height={s} viewBox="0 0 24 24" />;
  }
}

// ── ScribbleTitle ─────────────────────────────────────────────────────────────
export function ScribbleTitle({ children, size = 28, color = 'var(--ink)', accent = 'var(--terra)' }: { children: React.ReactNode; size?: number; color?: string; accent?: string }) {
  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <div style={{ fontFamily: 'var(--pen)', fontSize: size, lineHeight: 1.1, color, fontWeight: 600 }}>{children}</div>
      <svg width="100%" height="8" viewBox="0 0 200 8" preserveAspectRatio="none" style={{ display: 'block', marginTop: -2 }}>
        <path d="M2 4 Q40 1 80 4 T160 4 T198 5" stroke={accent} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── Squiggle ──────────────────────────────────────────────────────────────────
export function Squiggle({ w = 80, color = 'var(--terra)', strokeWidth = 2.2 }: { w?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg width={w} height={6} viewBox={`0 0 ${w} 6`} preserveAspectRatio="none">
      <path d={`M2 3 Q ${w * 0.25} 1 ${w * 0.5} 3 T ${w - 2} 3`} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── SketchButton ──────────────────────────────────────────────────────────────
export function SketchButton({ children, width = 110, height = 32, fill = 'var(--paper)', seed = 5, onClick, style }: { children: React.ReactNode; width?: number | string; height?: number; fill?: string; seed?: number; onClick?: () => void; style?: React.CSSProperties }) {
  const w = typeof width === 'number' ? width : 110;
  return (
    <div onClick={onClick} style={{ position: 'relative', width, height, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'var(--label)', fontSize: 15, color: 'var(--ink)', ...style }}>
      <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <path d={roughRectPath(3, 3, w - 6, height - 6, seed, 1)} fill={fill} stroke="var(--line)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ position: 'relative', padding: '0 10px' }}>{children}</span>
    </div>
  );
}

// ── PlantTag ──────────────────────────────────────────────────────────────────
export function PlantTag({ name, color = 'var(--green-soft)', icon, size = 'md' }: { name?: string; color?: string; icon?: PlantKind | string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? { font: 12, pad: '2px 6px', icon: 14 } : size === 'lg' ? { font: 16, pad: '5px 10px', icon: 22 } : { font: 14, pad: '3px 8px', icon: 18 };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: color, padding: sz.pad, fontFamily: 'var(--label)', fontSize: sz.font, borderRadius: 2, border: '1.2px solid var(--line)', whiteSpace: 'nowrap' }}>
      {icon && <PlantGlyph kind={icon} size={sz.icon} />}
      {name}
    </span>
  );
}

// ── StickyNote ────────────────────────────────────────────────────────────────
export function StickyNote({ children, color = 'var(--yellow-soft)', rotate = -2, w = 140, h = 90 }: { children: React.ReactNode; color?: string; rotate?: number; w?: number; h?: number }) {
  return (
    <div style={{ width: w, height: h, background: color, transform: `rotate(${rotate}deg)`, boxShadow: '2px 3px 0 rgba(0,0,0,0.08)', padding: '10px 12px', fontFamily: 'var(--note)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.3, flexShrink: 0 }}>
      {children}
    </div>
  );
}

// ── Dots ──────────────────────────────────────────────────────────────────────
export function Dots({ w = 200, color = 'var(--ink-faint)' }: { w?: number; color?: string }) {
  return (
    <svg width={w} height={4} viewBox={`0 0 ${w} 4`} style={{ display: 'block' }}>
      {Array.from({ length: Math.floor(w / 8) }).map((_, i) => (
        <circle key={i} cx={i * 8 + 2} cy={2} r={0.9} fill={color} />
      ))}
    </svg>
  );
}
