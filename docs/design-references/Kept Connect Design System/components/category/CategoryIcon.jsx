import React from 'react';

/**
 * CategoryIcon — the service-family wayfinding system (TIER 3 color).
 * Color groups trades into 8 families; the glyph identifies the trade.
 * Rendered the Uber way: a NEUTRAL chip surface with a family-colored
 * glyph — never a solid color block — so a wall of categories reads calm.
 */
export const CATEGORIES = {
  water:     { hue: '#2E6FB0', label: 'Water',     glyph: 'droplet', trades: 'Plumbing · drains · water heater · pool & spa' },
  power:     { hue: '#E0A12E', label: 'Power',     glyph: 'bolt',    trades: 'Electrical · lighting · solar · EV charger' },
  climate:   { hue: '#2C8A8A', label: 'Climate',   glyph: 'wind',    trades: 'HVAC · ventilation · insulation' },
  structure: { hue: '#4E6378', label: 'Structure', glyph: 'wall',    trades: 'Carpentry · framing · drywall · roofing · masonry' },
  surfaces:  { hue: '#6B5BD0', label: 'Surfaces',  glyph: 'roller',  trades: 'Painting · flooring · tile · wallpaper' },
  grounds:   { hue: '#6F8F3F', label: 'Grounds',   glyph: 'leaf',    trades: 'Landscaping · tree work · snow removal · fencing' },
  care:      { hue: '#A86A86', label: 'Care',      glyph: 'sparkle', trades: 'Cleaning · junk & haul · pest · pressure wash' },
  fixtures:  { hue: '#7B7064', label: 'Fixtures',  glyph: 'key',     trades: 'Handyman · locksmith · appliance · garage · smart home' },
};

const GLYPHS = {
  droplet: <path d="M12 3.5C12 3.5 6.5 9.5 6.5 14a5.5 5.5 0 0 0 11 0C17.5 9.5 12 3.5 12 3.5z" />,
  bolt:    <path d="M13 3 6.5 13H11l-.5 8 7-10.5H12.5z" />,
  wind:    <><path d="M4 9h10a2.4 2.4 0 1 0-2.4-2.4" /><path d="M4 14h14a2.4 2.4 0 1 1-2.4 2.4" /></>,
  wall:    <><rect x="3" y="5.5" width="8" height="5" rx="1" /><rect x="13" y="5.5" width="8" height="5" rx="1" /><rect x="8" y="13" width="8" height="5" rx="1" /></>,
  roller:  <><rect x="4.5" y="5" width="12" height="6" rx="2.2" /><path d="M10.5 11v3.2h-3V20" /></>,
  leaf:    <><path d="M5.5 18.5C5.5 10.5 11 5 19 5c0 8-5.5 13.5-13.5 13.5z" /><path d="M6 18C10 14 14 10 18 6.5" /></>,
  sparkle: <path d="M12 4l1.6 5.4L19 11l-5.4 1.6L12 18l-1.6-5.4L5 11l5.4-1.6z" />,
  key:     <><circle cx="8" cy="9" r="3.2" /><path d="M10.3 11.3 19 20M16 17l2-2" /></>,
};

// Soft neutral tint of a hue for the chip background (the calm Uber chip).
// light: mix 14% hue into #F4; dark: mix 22% hue into #25 chrome.
function tint(hex, dark) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const base = dark ? 37 : 244, hueW = dark ? 0.22 : 0.14;
  const mix = (c) => Math.round(c * hueW + base * (1 - hueW));
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}
// Brighten ~9% on dark for legibility (the brief's rule).
function onDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const up = (c) => Math.min(255, Math.round(c + (255 - c) * 0.18));
  return `rgb(${up(r)},${up(g)},${up(b)})`;
}

export function CategoryIcon({
  category = 'water',
  size = 46,
  dark = false,
  chip = true,          // false = bare glyph, no chip surface
  className = '',
  style = {},
  ...rest
}) {
  const cat = CATEGORIES[category] || CATEGORIES.water;
  const hue = dark ? onDark(cat.hue) : cat.hue;
  const glyphSize = Math.round(size * 0.5);

  const svg = (
    <svg
      width={chip ? glyphSize : size}
      height={chip ? glyphSize : size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={hue}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[cat.glyph]}
    </svg>
  );

  if (!chip) {
    return <span className={`kc-cat ${className}`} style={{ display: 'inline-flex', ...style }} {...rest}>{svg}</span>;
  }

  return (
    <span
      className={`kc-cat kc-cat--${category} ${className}`}
      title={cat.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        background: tint(cat.hue, dark),
        flex: '0 0 auto',
        ...style,
      }}
      {...rest}
    >
      {svg}
    </span>
  );
}
