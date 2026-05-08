export const BED_COLORS = [
  'var(--green-soft)',
  'var(--terra-soft)',
  'var(--yellow-soft)',
  'var(--purple-soft)',
  'var(--sky-soft)',
];

export function cellColor(plantId: string): string {
  const map: Record<string, string> = {
    tomato:  'rgba(184,98,58,0.18)',
    pepper:  'rgba(232,197,71,0.22)',
    lettuce: 'rgba(106,138,58,0.22)',
    carrot:  'rgba(184,98,58,0.14)',
    herb:    'rgba(106,138,58,0.18)',
    onion:   'rgba(214,199,224,0.4)',
    flower:  'rgba(232,197,71,0.3)',
    bean:    'rgba(106,138,58,0.18)',
  };
  return map[plantId] || 'var(--paper)';
}
