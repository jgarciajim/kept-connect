/* @ds-bundle: {"format":3,"namespace":"KeptConnectDesignSystem_4a1eb7","components":[{"name":"KeptConnectLogo","sourcePath":"components/brand/KeptConnectLogo.jsx"},{"name":"CATEGORIES","sourcePath":"components/category/CategoryIcon.jsx"},{"name":"CategoryIcon","sourcePath":"components/category/CategoryIcon.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Avatar","sourcePath":"components/people/Avatar.jsx"},{"name":"Tag","sourcePath":"components/trust/Tag.jsx"},{"name":"VerifiedBadge","sourcePath":"components/trust/VerifiedBadge.jsx"}],"sourceHashes":{"components/brand/KeptConnectLogo.jsx":"77cd3497cbe1","components/category/CategoryIcon.jsx":"ff20d930248e","components/core/Button.jsx":"531c14ffea1b","components/core/Card.jsx":"e490c3dfdbc4","components/forms/Input.jsx":"a9bc1fa20143","components/people/Avatar.jsx":"8d8358527b57","components/trust/Tag.jsx":"bec4a6a2a2ee","components/trust/VerifiedBadge.jsx":"dd7b5079b94e","ui_kits/provider/Screens.jsx":"35b35c02366e","ui_kits/provider/Shell.jsx":"404d95c4252e","ui_kits/provider/icons.jsx":"273e4595449c","ui_kits/requester/ComposerScreen.jsx":"948ff8fb4499","ui_kits/requester/MatchScreen.jsx":"1c4937909f8a","ui_kits/requester/ProfileScreen.jsx":"f514cd61d85a","ui_kits/requester/ThreadScreen.jsx":"1592ecf26adc","ui_kits/requester/icons.jsx":"38639b73d912"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.KeptConnectDesignSystem_4a1eb7 = window.KeptConnectDesignSystem_4a1eb7 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/KeptConnectLogo.jsx
try { (() => {
/**
 * Kept Connect mark — the "K-link" dispatch fan-out.
 * A geometric K whose three arms fire from the vertex into chevron
 * arrowheads: one request dispatched to many providers.
 * Pure vector, viewBox 0 0 120 120. Locked geometry — do not redraw.
 */
function Mark({
  stroke
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("g", {
    fill: "none",
    stroke: stroke,
    strokeWidth: "9.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M38 30 V90"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M38 60 L82 36"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M38 60 L86 60"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M38 60 L82 84"
  })), /*#__PURE__*/React.createElement("g", {
    fill: "none",
    stroke: stroke,
    strokeWidth: "8.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M77.45 46.46 L82 36 L70.75 34.16"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M77 67 L86 60 L77 53"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M77.45 73.54 L82 84 L70.75 85.84"
  })));
}
const TREATMENTS = {
  'app-icon': {
    block: 'var(--terracotta-deep)',
    mark: 'var(--cream)'
  },
  'on-light': {
    block: 'none',
    mark: 'var(--terracotta)'
  },
  'on-chrome': {
    block: 'var(--chrome)',
    mark: 'var(--cream)'
  },
  'mono': {
    block: 'none',
    mark: 'var(--ink)'
  },
  'reversed': {
    block: 'none',
    mark: 'var(--cream)'
  },
  'blue': {
    block: 'var(--blue)',
    mark: 'var(--blue-ink)'
  }
};

/**
 * KeptConnectLogo — the brand identity.
 * variant="mark" renders just the squircle mark; variant="lockup"
 * renders mark + "Kept Connect." wordmark (horizontal or stacked).
 */
function KeptConnectLogo({
  treatment = 'on-light',
  variant = 'mark',
  size = 48,
  orientation = 'horizontal',
  className = '',
  style = {}
}) {
  const t = TREATMENTS[treatment] || TREATMENTS['on-light'];
  const hasBlock = t.block !== 'none';
  const radius = Math.round(size * 0.27); // squircle ≈ rx32/120

  const markSvg = /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 120 120",
    width: size,
    height: size,
    style: {
      display: 'block',
      borderRadius: hasBlock ? radius : 0,
      flex: '0 0 auto',
      ...(hasBlock ? {} : {})
    },
    "aria-hidden": "true"
  }, hasBlock && /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "6",
    width: "108",
    height: "108",
    rx: "32",
    fill: t.block
  }), /*#__PURE__*/React.createElement(Mark, {
    stroke: t.mark
  }));
  if (variant === 'mark') {
    return /*#__PURE__*/React.createElement("span", {
      className: className,
      style: {
        display: 'inline-flex',
        ...style
      }
    }, markSvg);
  }

  // Wordmark color follows treatment: cream/blue-ink on dark, else ink.
  const wordColor = treatment === 'reversed' || treatment === 'on-chrome' ? 'var(--cream)' : treatment === 'blue' ? 'var(--blue-ink)' : 'var(--ink)';
  const wordSize = Math.round(size * 0.78);
  return /*#__PURE__*/React.createElement("span", {
    className: className,
    style: {
      display: 'inline-flex',
      flexDirection: orientation === 'stacked' ? 'column' : 'row',
      alignItems: 'center',
      gap: orientation === 'stacked' ? size * 0.22 : size * 0.34,
      ...style
    }
  }, markSvg, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: wordSize,
      letterSpacing: '-0.015em',
      lineHeight: 1,
      color: wordColor,
      whiteSpace: 'nowrap'
    }
  }, "Kept ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 400
    }
  }, "Connect"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--terracotta)'
    }
  }, ".")));
}
Object.assign(__ds_scope, { KeptConnectLogo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/KeptConnectLogo.jsx", error: String((e && e.message) || e) }); }

// components/category/CategoryIcon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CategoryIcon — the service-family wayfinding system (TIER 3 color).
 * Color groups trades into 8 families; the glyph identifies the trade.
 * Rendered the Uber way: a NEUTRAL chip surface with a family-colored
 * glyph — never a solid color block — so a wall of categories reads calm.
 */
const CATEGORIES = {
  water: {
    hue: '#2E6FB0',
    label: 'Water',
    glyph: 'droplet',
    trades: 'Plumbing · drains · water heater · pool & spa'
  },
  power: {
    hue: '#E0A12E',
    label: 'Power',
    glyph: 'bolt',
    trades: 'Electrical · lighting · solar · EV charger'
  },
  climate: {
    hue: '#2C8A8A',
    label: 'Climate',
    glyph: 'wind',
    trades: 'HVAC · ventilation · insulation'
  },
  structure: {
    hue: '#4E6378',
    label: 'Structure',
    glyph: 'wall',
    trades: 'Carpentry · framing · drywall · roofing · masonry'
  },
  surfaces: {
    hue: '#6B5BD0',
    label: 'Surfaces',
    glyph: 'roller',
    trades: 'Painting · flooring · tile · wallpaper'
  },
  grounds: {
    hue: '#6F8F3F',
    label: 'Grounds',
    glyph: 'leaf',
    trades: 'Landscaping · tree work · snow removal · fencing'
  },
  care: {
    hue: '#A86A86',
    label: 'Care',
    glyph: 'sparkle',
    trades: 'Cleaning · junk & haul · pest · pressure wash'
  },
  fixtures: {
    hue: '#7B7064',
    label: 'Fixtures',
    glyph: 'key',
    trades: 'Handyman · locksmith · appliance · garage · smart home'
  }
};
const GLYPHS = {
  droplet: /*#__PURE__*/React.createElement("path", {
    d: "M12 3.5C12 3.5 6.5 9.5 6.5 14a5.5 5.5 0 0 0 11 0C17.5 9.5 12 3.5 12 3.5z"
  }),
  bolt: /*#__PURE__*/React.createElement("path", {
    d: "M13 3 6.5 13H11l-.5 8 7-10.5H12.5z"
  }),
  wind: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M4 9h10a2.4 2.4 0 1 0-2.4-2.4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 14h14a2.4 2.4 0 1 1-2.4 2.4"
  })),
  wall: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5.5",
    width: "8",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "13",
    y: "5.5",
    width: "8",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "13",
    width: "8",
    height: "5",
    rx: "1"
  })),
  roller: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "4.5",
    y: "5",
    width: "12",
    height: "6",
    rx: "2.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.5 11v3.2h-3V20"
  })),
  leaf: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M5.5 18.5C5.5 10.5 11 5 19 5c0 8-5.5 13.5-13.5 13.5z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 18C10 14 14 10 18 6.5"
  })),
  sparkle: /*#__PURE__*/React.createElement("path", {
    d: "M12 4l1.6 5.4L19 11l-5.4 1.6L12 18l-1.6-5.4L5 11l5.4-1.6z"
  }),
  key: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "9",
    r: "3.2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M10.3 11.3 19 20M16 17l2-2"
  }))
};

// Soft neutral tint of a hue for the chip background (the calm Uber chip).
// light: mix 14% hue into #F4; dark: mix 22% hue into #25 chrome.
function tint(hex, dark) {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  const base = dark ? 37 : 244,
    hueW = dark ? 0.22 : 0.14;
  const mix = c => Math.round(c * hueW + base * (1 - hueW));
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}
// Brighten ~9% on dark for legibility (the brief's rule).
function onDark(hex) {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);
  const up = c => Math.min(255, Math.round(c + (255 - c) * 0.18));
  return `rgb(${up(r)},${up(g)},${up(b)})`;
}
function CategoryIcon({
  category = 'water',
  size = 46,
  dark = false,
  chip = true,
  // false = bare glyph, no chip surface
  className = '',
  style = {},
  ...rest
}) {
  const cat = CATEGORIES[category] || CATEGORIES.water;
  const hue = dark ? onDark(cat.hue) : cat.hue;
  const glyphSize = Math.round(size * 0.5);
  const svg = /*#__PURE__*/React.createElement("svg", {
    width: chip ? glyphSize : size,
    height: chip ? glyphSize : size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: hue,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, GLYPHS[cat.glyph]);
  if (!chip) {
    return /*#__PURE__*/React.createElement("span", _extends({
      className: `kc-cat ${className}`,
      style: {
        display: 'inline-flex',
        ...style
      }
    }, rest), svg);
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `kc-cat kc-cat--${category} ${className}`,
    title: cat.label,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.32),
      background: tint(cat.hue, dark),
      flex: '0 0 auto',
      ...style
    }
  }, rest), svg);
}
Object.assign(__ds_scope, { CATEGORIES, CategoryIcon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/category/CategoryIcon.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the single emerald primary is the one obvious action per surface.
 * Never two primaries on one screen. Emerald means "do something", always.
 */
function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon = null,
  iconRight = null,
  children,
  className = '',
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      fontSize: 13,
      padding: '8px 14px',
      height: 36,
      gap: 6
    },
    md: {
      fontSize: 15,
      padding: '11px 20px',
      height: 44,
      gap: 8
    },
    lg: {
      fontSize: 17,
      padding: '15px 26px',
      height: 54,
      gap: 9
    }
  };
  const s = sizes[size] || sizes.md;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    height: s.height,
    padding: s.padding,
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'var(--font-ui)',
    fontWeight: 500,
    fontSize: s.fontSize,
    lineHeight: 1,
    letterSpacing: '-0.005em',
    borderRadius: 'var(--r-pill)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease)',
    whiteSpace: 'nowrap',
    userSelect: 'none'
  };
  const variants = {
    primary: {
      background: 'var(--terracotta)',
      color: 'var(--cream)'
    },
    secondary: {
      background: 'var(--paper)',
      color: 'var(--ink)',
      borderColor: 'var(--hairline)'
    },
    // Terracotta outline — the "ghost award" pattern (actionable, quieter)
    outline: {
      background: 'transparent',
      color: 'var(--terracotta)',
      borderColor: 'var(--terracotta)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink-2)'
    },
    // For use on dark chrome surfaces (provider app) — brightened terracotta
    'chrome-primary': {
      background: 'var(--terracotta-bright)',
      color: 'var(--cream)'
    },
    'chrome-ghost': {
      background: 'transparent',
      color: 'var(--chrome-cream)',
      borderColor: 'var(--chrome-line)'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    className: `kc-btn kc-btn--${variant} ${className}`,
    style: {
      ...base,
      ...(variants[variant] || variants.primary),
      ...style
    },
    onMouseDown: e => {
      if (!disabled) e.currentTarget.style.transform = 'scale(0.97)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = 'scale(1)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'scale(1)';
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flex: '0 0 auto'
    }
  }, icon), children, iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flex: '0 0 auto'
    }
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the surface primitive.
 * tone="paper" = clean data surface (quotes, prices, stats, history).
 * tone="moment" = warm cream, HUMAN MOMENTS ONLY (hero, onboarding,
 * confirmation, empty states). Never put numbers on a moment card.
 * tone="chrome" = dark provider-app card.
 */
function Card({
  tone = 'paper',
  ribbon = null,
  // null | 'sameday' | 'urgent' | 'emerald' — left-edge ribbon flag
  padding = 20,
  radius = 'var(--r-card)',
  lift = false,
  // raise with a soft shadow
  children,
  className = '',
  style = {},
  ...rest
}) {
  const tones = {
    paper: {
      background: 'var(--paper)',
      color: 'var(--ink)',
      border: '1px solid var(--hairline)'
    },
    moment: {
      background: 'var(--moment)',
      color: 'var(--ink)',
      border: '1px solid transparent'
    },
    canvas: {
      background: 'var(--canvas)',
      color: 'var(--ink)',
      border: '1px solid var(--hairline)'
    },
    chrome: {
      background: 'var(--chrome-2)',
      color: 'var(--cream)',
      border: '1px solid rgba(244,241,232,0.08)'
    }
  };
  const ribbonColors = {
    sameday: 'var(--flag-sameday)',
    urgent: 'var(--flag-urgent)',
    emerald: 'var(--emerald)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: `kc-card kc-card--${tone} ${className}`,
    style: {
      position: 'relative',
      borderRadius: radius,
      padding,
      boxShadow: lift ? 'var(--shadow-card)' : 'none',
      overflow: 'hidden',
      ...tones[tone],
      ...style
    }
  }, rest), ribbon && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      background: ribbonColors[ribbon] || 'var(--emerald)'
    }
  }), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — the composer field. Big touch targets, generous spacing,
 * sentence-case labels that say what they do. Emerald focus ring.
 * Supports single-line and multiline (textarea).
 */
function Input({
  label = null,
  hint = null,
  multiline = false,
  rows = 3,
  value,
  defaultValue,
  placeholder = '',
  prefix = null,
  // leading node (icon or text, e.g. "$")
  align = 'left',
  // 'left' | 'right' — right for money/figures
  tabular = false,
  // tabular-nums for numeric fields
  disabled = false,
  className = '',
  style = {},
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const fieldStyle = {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-ui)',
    fontWeight: 400,
    fontSize: 15,
    lineHeight: 1.5,
    color: 'var(--ink)',
    textAlign: align,
    resize: multiline ? 'vertical' : 'none',
    ...(tabular ? {
      fontVariantNumeric: 'tabular-nums lining-nums'
    } : {})
  };
  const Field = multiline ? 'textarea' : 'input';
  return /*#__PURE__*/React.createElement("label", {
    className: `kc-field ${className}`,
    style: {
      display: 'block',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--font-ui)',
      fontWeight: 500,
      fontSize: 13,
      color: 'var(--ink-2)',
      marginBottom: 7
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: multiline ? 'flex-start' : 'center',
      gap: 9,
      padding: multiline ? '12px 14px' : '0 14px',
      minHeight: multiline ? 'auto' : 48,
      background: 'var(--paper)',
      border: `1px solid ${focused ? 'var(--terracotta)' : 'var(--hairline)'}`,
      boxShadow: focused ? '0 0 0 3px var(--terracotta-tint)' : 'none',
      borderRadius: 'var(--r-chip)',
      transition: 'border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)',
      opacity: disabled ? 0.5 : 1
    }
  }, prefix && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: '0 0 auto',
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-ui)',
      fontSize: 15
    }
  }, prefix), /*#__PURE__*/React.createElement(Field, _extends({}, value !== undefined ? {
    value
  } : {
    defaultValue
  }, {
    placeholder: placeholder,
    rows: multiline ? rows : undefined,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: fieldStyle
  }, rest))), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 12,
      color: 'var(--ink-3)',
      marginTop: 6
    }
  }, hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/people/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Avatar — the circular assignment language, inherited from the ops tool.
 * Soft-tinted circle, 2px white inner border, optional activity-ring status.
 * Connect extends the ring STATES for the marketplace (responding/quoted/
 * awarded/en-route/on-site/done) but never the shape language.
 */
const RING = {
  none: null,
  responding: {
    color: 'var(--ink-3)',
    fill: false,
    pulse: true
  },
  // searching — neutral, in motion
  quoted: {
    color: 'var(--terracotta)',
    fill: false
  },
  awarded: {
    color: 'var(--terracotta)',
    fill: true
  },
  // filled ring
  enroute: {
    color: 'var(--terracotta)',
    fill: false
  },
  // live job state
  onsite: {
    color: 'var(--terracotta)',
    fill: false
  },
  done: {
    color: 'var(--ink-3)',
    fill: false
  }
};

// Stable soft tint from a name (avatar background when no image).
const TINTS = ['#E4F0EA', '#F3E7D8', '#E6E9F2', '#F1E6E6', '#E8EFE6', '#EFE9F1', '#E9EEF0'];
function tintFor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  return TINTS[h % TINTS.length];
}
function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function Avatar({
  name = '',
  src = null,
  size = 44,
  status = 'none',
  // ring state, see RING
  className = '',
  style = {},
  ...rest
}) {
  const ring = RING[status] || null;
  const ringWidth = Math.max(2, Math.round(size * 0.06));
  const gap = ring ? ringWidth + 3 : 0; // ring sits outside a small gap

  const inner = /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      background: src ? `center/cover no-repeat url(${src})` : tintFor(name),
      boxShadow: '0 0 0 2px var(--paper)',
      // 2px white inner border (signature)
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--ink-2)',
      fontFamily: 'var(--font-ui)',
      fontWeight: 500,
      fontSize: Math.round(size * 0.36),
      letterSpacing: '0.01em',
      flex: '0 0 auto',
      overflow: 'hidden'
    }
  }, !src && initials(name));
  if (!ring) {
    return /*#__PURE__*/React.createElement("span", _extends({
      className: `kc-avatar ${className}`,
      style: {
        display: 'inline-flex',
        ...style
      }
    }, rest), inner);
  }
  const total = size + (gap + ringWidth) * 2;
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `kc-avatar kc-avatar--${status} ${className}`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: total,
      height: total,
      borderRadius: '50%',
      border: `${ringWidth}px solid ${ring.color}`,
      background: ring.fill ? ring.color : 'transparent',
      ...(ring.pulse ? {
        animation: 'kc-ring-pulse 1.6s var(--ease) infinite'
      } : {}),
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("style", null, `
        @keyframes kc-ring-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(164,162,153,0.0); }
          50%      { box-shadow: 0 0 0 5px rgba(164,162,153,0.20); }
        }
        @media (prefers-reduced-motion: reduce) {
          .kc-avatar--responding { animation: none !important; }
        }
      `), inner);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/people/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/trust/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tag — quiet descriptive pill. Credentials (Licensed, Insured,
 * Background checked) and trades render as calm --tag-bg pills.
 * Trust facts are *description*, not badges shouting for attention.
 */
function Tag({
  variant = 'default',
  // default | trade | status
  status = null,
  // for variant="status": 'live' | 'verified' | 'neutral'
  icon = null,
  children,
  className = '',
  style = {},
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    height: 22,
    padding: '0 10px',
    fontFamily: 'var(--font-ui)',
    fontWeight: 500,
    fontSize: 11,
    lineHeight: 1,
    letterSpacing: '0.005em',
    borderRadius: 'var(--r-pill)',
    whiteSpace: 'nowrap'
  };
  const statusColors = {
    live: {
      bg: 'var(--terracotta-tint)',
      ink: 'var(--terracotta-deep)'
    },
    verified: {
      bg: '#E4F0EA',
      ink: 'var(--verified)'
    },
    neutral: {
      bg: 'var(--neutral)',
      ink: 'var(--ink-2)'
    }
  };
  let toneStyle;
  if (variant === 'status' && status && statusColors[status]) {
    toneStyle = {
      background: statusColors[status].bg,
      color: statusColors[status].ink
    };
  } else if (variant === 'trade') {
    toneStyle = {
      background: 'var(--paper)',
      color: 'var(--ink-2)',
      boxShadow: 'inset 0 0 0 1px var(--hairline)'
    };
  } else {
    toneStyle = {
      background: 'var(--tag-bg)',
      color: 'var(--tag-ink)'
    };
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `kc-tag kc-tag--${variant} ${className}`,
    style: {
      ...base,
      ...toneStyle,
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flex: '0 0 auto'
    }
  }, icon), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trust/Tag.jsx", error: String((e && e.message) || e) }); }

// components/trust/VerifiedBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * VerifiedBadge — the trust treatment, signature #2.
 * A small emerald check beside a provider name. Emerald = safe/affirmed.
 * One, clean. Never a loud shield, gold seal, or animated badge —
 * restraint is the credibility.
 */
function VerifiedBadge({
  size = 16,
  label = false,
  // show "Verified" text beside the check
  className = '',
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `kc-verified ${className}`,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      ...style
    },
    title: "Verified"
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    fill: "var(--verified)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 12.2 L10.8 15 L16 9.4",
    fill: "none",
    stroke: "var(--cream)",
    strokeWidth: "2.1",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-ui)',
      fontWeight: 500,
      fontSize: 12,
      color: 'var(--verified)',
      letterSpacing: '0.005em'
    }
  }, "Verified"));
}
Object.assign(__ds_scope, { VerifiedBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/trust/VerifiedBadge.jsx", error: String((e && e.message) || e) }); }

// ui_kits/provider/Screens.jsx
try { (() => {
/* Provider app — Job feed (live offer), Active job, Earnings. */
const VDS2 = window.KeptConnectDesignSystem_4a1eb7;
const {
  Avatar: TAvatar,
  CategoryIcon: TCat,
  KeptConnectLogo: TLogo
} = VDS2;
const dim = o => `rgba(233,230,221,${o})`;
function SectionHead({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--chrome-dim)',
      margin: '18px 4px 9px'
    }
  }, children);
}

/* ---- Feed -------------------------------------------------------------- */
const OFFER = {
  cat: 'water',
  title: 'Faucet replacement',
  place: 'Breckenridge',
  dist: '1.2 mi away',
  pay: '120',
  note: 'est. 45 min · paid on completion',
  timer: '0:43'
};
function FeedScreen({
  onOpenJob
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      background: 'var(--chrome)'
    }
  }, /*#__PURE__*/React.createElement(VStatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '4px 16px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '4px 2px 2px'
    }
  }, /*#__PURE__*/React.createElement(TLogo, {
    treatment: "app-icon",
    size: 30
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 16,
      color: 'var(--chrome-cream)'
    }
  }, "Morning, Marco"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11.5,
      color: 'var(--verified-bright)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 9,
      background: 'var(--verified-bright)'
    }
  }), " Online")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      background: 'var(--chrome-card)',
      border: '1px solid var(--chrome-line)',
      borderRadius: 16,
      padding: '13px 15px',
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--chrome-dim)'
    }
  }, "Available to cash out"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 21,
      color: 'var(--chrome-cream)',
      fontVariantNumeric: 'tabular-nums',
      marginTop: 1
    }
  }, "$340.00")), /*#__PURE__*/React.createElement("button", {
    style: {
      marginLeft: 'auto',
      background: 'var(--terracotta-bright)',
      color: 'var(--cream)',
      fontSize: 12.5,
      fontWeight: 500,
      borderRadius: 999,
      padding: '9px 15px',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-ui)'
    }
  }, "Cash out")), /*#__PURE__*/React.createElement(SectionHead, null, "New offer"), /*#__PURE__*/React.createElement(OfferCard, {
    job: OFFER,
    onAction: () => onOpenJob()
  }), /*#__PURE__*/React.createElement(SectionHead, null, "Scheduled today"), /*#__PURE__*/React.createElement("div", {
    onClick: onOpenJob,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      background: 'var(--chrome-card)',
      border: '1px solid var(--chrome-line)',
      borderRadius: 14,
      padding: '11px 12px',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(TCat, {
    category: "power",
    size: 36,
    dark: true
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 500,
      color: 'var(--chrome-cream)'
    }
  }, "Outlet install \xD73"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--chrome-dim)'
    }
  }, "Frisco \xB7 Power")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      textAlign: 'right',
      fontSize: 11.5,
      color: 'var(--chrome-dim)'
    }
  }, "2:30 PM", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--chrome-cream)',
      fontWeight: 500,
      fontVariantNumeric: 'tabular-nums'
    }
  }, "$180")))));
}

/* ---- Active job -------------------------------------------------------- */
function ActiveScreen({
  onBack
}) {
  const [stage, setStage] = React.useState(0); // 0 start, 1 complete, 2 paid
  const label = ['Start job', 'Mark complete', 'Mark paid'][stage];
  const done = stage > 2;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--chrome)'
    }
  }, /*#__PURE__*/React.createElement(VStatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '4px 16px 12px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      width: 30,
      height: 30,
      borderRadius: 999,
      border: 'none',
      background: 'var(--chrome-card)',
      cursor: 'pointer',
      color: 'var(--chrome-cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(PIconBack, {
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 17,
      color: 'var(--chrome-cream)'
    }
  }, "Faucet replacement")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 16px 16px',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 120,
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid var(--chrome-line)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 280 120",
    preserveAspectRatio: "xMidYMid slice",
    style: {
      display: 'block',
      width: '100%',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("rect", {
    width: "280",
    height: "120",
    fill: "#211F1B"
  }), /*#__PURE__*/React.createElement("g", {
    stroke: "#2E2B27",
    strokeWidth: "6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M-10 36 H290"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-10 92 H290"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M80 -10 V130"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M205 -10 V130"
  })), /*#__PURE__*/React.createElement("path", {
    d: "M80 92 L80 60 L205 60 L205 36",
    fill: "none",
    stroke: "var(--terracotta-bright)",
    strokeWidth: "4",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "80",
    cy: "92",
    r: "7",
    fill: "var(--terracotta-bright)",
    stroke: "#1A1916",
    strokeWidth: "3"
  }), /*#__PURE__*/React.createElement("g", {
    transform: "translate(205 36)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 6 C0 6 8 0 8 -6 A8 8 0 1 0 -8 -6 C-8 0 0 6 0 6 z",
    fill: "#E9E6DD"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "0",
    cy: "-6",
    r: "3",
    fill: "#1A1916"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      background: 'var(--chrome-card)',
      border: '1px solid var(--chrome-line)',
      borderRadius: 16,
      padding: 12,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(TAvatar, {
    name: "Sarah K",
    size: 38
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--chrome-cream)'
    }
  }, "Sarah K."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--chrome-dim)'
    }
  }, "142 Ski Hill Rd \xB7 gate code in notes")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, [PIconPhone, PIconChat].map((I, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 36,
      height: 36,
      borderRadius: 999,
      background: 'var(--chrome-card-2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--chrome-cream)'
    }
  }, /*#__PURE__*/React.createElement(I, {
    size: 17
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9,
      marginTop: 12
    }
  }, ['Before', 'After'].map(l => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      flex: 1,
      height: 62,
      border: '1.5px dashed var(--chrome-line)',
      borderRadius: 14,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      color: 'var(--chrome-dim)',
      fontSize: 10.5
    }
  }, /*#__PURE__*/React.createElement(PIconCam, {
    size: 18
  }), /*#__PURE__*/React.createElement("span", null, l)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 13,
      fontSize: 12.5,
      color: 'var(--chrome-dim)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Payout on completion"), /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--chrome-cream)',
      fontWeight: 500,
      fontVariantNumeric: 'tabular-nums'
    }
  }, "$120.00")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      paddingTop: 16
    }
  }, !done ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setStage(s => s + 1),
    style: {
      width: '100%',
      background: 'var(--terracotta-bright)',
      color: 'var(--cream)',
      textAlign: 'center',
      borderRadius: 16,
      padding: 15,
      fontSize: 15,
      fontWeight: 500,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-ui)'
    }
  }, label) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: 'var(--verified-bright)',
      fontWeight: 500,
      fontSize: 15,
      padding: 15,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(PIconCheck, {
    size: 20
  }), " Paid \u2014 nice work."))));
}

/* ---- Earnings ---------------------------------------------------------- */
function EarningsScreen() {
  const rows = [{
    job: 'Clear shower drain',
    who: 'Joan Ek',
    when: 'Today',
    amt: '120.00',
    status: 'Pending'
  }, {
    job: 'Faucet replacement',
    who: 'Priya Nair',
    when: 'Yesterday',
    amt: '180.00',
    status: 'Paid'
  }, {
    job: 'Leak repair',
    who: 'Theo Vance',
    when: 'Mon',
    amt: '240.00',
    status: 'Paid'
  }, {
    job: 'Water heater flush',
    who: 'Sam Cole',
    when: 'Sun',
    amt: '160.00',
    status: 'Paid'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      background: 'var(--chrome)'
    }
  }, /*#__PURE__*/React.createElement(VStatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '4px 16px 16px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 26,
      margin: '6px 2px 16px',
      color: 'var(--chrome-cream)',
      letterSpacing: '-0.015em'
    }
  }, "Earnings", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--terracotta-bright)'
    }
  }, ".")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--chrome-card)',
      border: '1px solid var(--chrome-line)',
      borderRadius: 16,
      padding: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--chrome-dim)'
    }
  }, "Available to cash out"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 32,
      color: 'var(--chrome-cream)',
      fontVariantNumeric: 'tabular-nums',
      marginTop: 2
    }
  }, "$340.00"), /*#__PURE__*/React.createElement("button", {
    style: {
      marginTop: 13,
      width: '100%',
      height: 44,
      borderRadius: 999,
      border: 'none',
      background: 'var(--terracotta-bright)',
      color: 'var(--cream)',
      fontFamily: 'var(--font-ui)',
      fontWeight: 500,
      fontSize: 15,
      cursor: 'pointer'
    }
  }, "Cash out instantly")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 11,
      margin: '12px 0 20px'
    }
  }, [['This week', '$3,180'], ['Jobs', '14'], ['Rating', '4.9']].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      flex: 1,
      background: 'var(--chrome-card)',
      border: '1px solid var(--chrome-line)',
      borderRadius: 12,
      padding: '12px 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 500,
      color: 'var(--chrome-cream)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--chrome-dim)',
      marginTop: 2
    }
  }, l)))), /*#__PURE__*/React.createElement(SectionHead, null, "Recent payouts"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--chrome-card)',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid var(--chrome-line)'
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '13px 16px',
      borderTop: i ? '1px solid var(--chrome-line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--chrome-cream)'
    }
  }, r.job), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--chrome-dim)',
      marginTop: 1
    }
  }, r.who, " \xB7 ", r.when)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: 'var(--chrome-cream)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, "$", r.amt), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: r.status === 'Paid' ? 'var(--verified-bright)' : 'var(--terracotta-bright)',
      marginTop: 1
    }
  }, r.status)))))));
}
Object.assign(window, {
  FeedScreen,
  ActiveScreen,
  EarningsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/provider/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/provider/Shell.jsx
try { (() => {
/* Provider app — the cool sibling. Dark chrome, dense, fast pay.
   Terracotta (brightened) is the only accent; verified stays emerald. */
const VDS = window.KeptConnectDesignSystem_4a1eb7;
const {
  Avatar: VAvatar,
  CategoryIcon: VCat
} = VDS;
function VStatusBar() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 42,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 22px',
      color: 'var(--chrome-dim)',
      fontSize: 13,
      fontWeight: 500,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: 'tabular-nums'
    }
  }, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 5,
      opacity: 0.9
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "11",
    viewBox: "0 0 17 11",
    fill: "var(--chrome-dim)"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "6",
    width: "3",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.5",
    y: "4",
    width: "3",
    height: "7",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "2",
    width: "3",
    height: "9",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "13.5",
    y: "0",
    width: "3",
    height: "11",
    rx: "1"
  })), /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "11",
    viewBox: "0 0 25 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "21",
    height: "11",
    rx: "3",
    stroke: "var(--chrome-dim)",
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "16",
    height: "8",
    rx: "1.5",
    fill: "var(--chrome-dim)"
  }))));
}
function VBottomNav({
  tab,
  setTab
}) {
  const items = [['jobs', 'Jobs', PIconJobs], ['active', 'Active', PIconActive], ['earnings', 'Earnings', PIconWallet], ['you', 'You', PIconUser]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 18px 16px',
      borderTop: '1px solid var(--chrome-line)',
      flex: '0 0 auto'
    }
  }, items.map(([id, label, I]) => {
    const on = tab === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => setTab(id),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        color: on ? 'var(--terracotta-bright)' : 'var(--chrome-dim)'
      }
    }, /*#__PURE__*/React.createElement(I, {
      size: 22,
      sw: on ? 2.2 : 2
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        fontWeight: 500
      }
    }, label));
  }));
}

/* the round-robin offer card — respond timer, set rate, accept/decline */
function OfferCard({
  job,
  onAction
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: 'var(--chrome-card-2)',
      border: '1px solid var(--terracotta-deep)',
      borderRadius: 18,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 12,
      right: 14,
      fontSize: 11,
      color: 'var(--terracotta-bright)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, job.timer), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement(VCat, {
    category: job.cat,
    size: 42,
    dark: true
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 500,
      color: 'var(--chrome-cream)'
    }
  }, job.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--chrome-dim)',
      marginTop: 1
    }
  }, job.place, " \xB7 ", job.dist))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      margin: '12px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 24,
      color: 'var(--chrome-cream)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, "$", job.pay), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: 'var(--chrome-dim)'
    }
  }, job.note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onAction('decline', job),
    style: {
      flex: 1,
      borderRadius: 999,
      padding: 11,
      fontSize: 13.5,
      fontWeight: 500,
      background: 'transparent',
      color: 'var(--chrome-dim)',
      border: '1px solid var(--chrome-line)',
      cursor: 'pointer',
      fontFamily: 'var(--font-ui)'
    }
  }, "Decline"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onAction('accept', job),
    style: {
      flex: 1,
      borderRadius: 999,
      padding: 11,
      fontSize: 13.5,
      fontWeight: 500,
      background: 'var(--terracotta-bright)',
      color: 'var(--cream)',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-ui)'
    }
  }, "Accept")));
}
Object.assign(window, {
  VStatusBar,
  VBottomNav,
  OfferCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/provider/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/provider/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Provider app — icon set (the brand's own glyphs, from the provider-app
   exploration). Monochrome line, 2px, round caps. Inherit currentColor. */
const PIc = ({
  d,
  size = 22,
  sw = 2,
  fill = 'none',
  children,
  ...p
}) => /*#__PURE__*/React.createElement("svg", _extends({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: fill,
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, p), d ? /*#__PURE__*/React.createElement("path", {
  d: d
}) : children);
const PIconJobs = p => /*#__PURE__*/React.createElement(PIc, p, /*#__PURE__*/React.createElement("path", {
  d: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"
}));
const PIconActive = p => /*#__PURE__*/React.createElement(PIc, p, /*#__PURE__*/React.createElement("rect", {
  x: "6",
  y: "4",
  width: "12",
  height: "17",
  rx: "2.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 4.5h6v2.5H9z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 11h6M9 15h4"
}));
const PIconWallet = p => /*#__PURE__*/React.createElement(PIc, p, /*#__PURE__*/React.createElement("rect", {
  x: "3.5",
  y: "6",
  width: "17",
  height: "12",
  rx: "2.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3.5 9.5h17M16 13h1.5"
}));
const PIconUser = p => /*#__PURE__*/React.createElement(PIc, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "8.5",
  r: "3.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5.5 20a6.5 6.5 0 0 1 13 0"
}));
const PIconBack = p => /*#__PURE__*/React.createElement(PIc, p, /*#__PURE__*/React.createElement("path", {
  d: "M14 6l-6 6 6 6"
}));
const PIconPhone = p => /*#__PURE__*/React.createElement(PIc, p, /*#__PURE__*/React.createElement("path", {
  d: "M6 4h3l1.6 4-2 1.2c.9 2.3 2.5 3.9 4.8 4.8l1.2-2 4 1.6V17c0 .6-.4 1-1 1C11.3 18 6 12.7 6 6c0-.6.4-1 1-1z"
}));
const PIconChat = p => /*#__PURE__*/React.createElement(PIc, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1z"
}));
const PIconCam = p => /*#__PURE__*/React.createElement(PIc, p, /*#__PURE__*/React.createElement("rect", {
  x: "3.5",
  y: "7",
  width: "17",
  height: "12",
  rx: "2.5"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "13",
  r: "3.2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 7l1.2-2h3.6L15 7"
}));
const PIconCheck = p => /*#__PURE__*/React.createElement(PIc, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 12.5 10 17 19 6.5"
}));
Object.assign(window, {
  PIc,
  PIconJobs,
  PIconActive,
  PIconWallet,
  PIconUser,
  PIconBack,
  PIconPhone,
  PIconChat,
  PIconCam,
  PIconCheck
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/provider/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/requester/ComposerScreen.jsx
try { (() => {
/* Requester app — shell (status bar, header, bottom nav), Home, and the
   post-a-job Composer. Warm, terracotta action, category wayfinding. */
const DS = window.KeptConnectDesignSystem_4a1eb7;
const {
  Button,
  Card,
  Avatar,
  Tag,
  VerifiedBadge,
  Input,
  KeptConnectLogo,
  CategoryIcon
} = DS;

/* ---- shell ------------------------------------------------------------- */
function StatusBar() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 42,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 22px',
      color: 'var(--ink)',
      fontSize: 13,
      fontWeight: 500,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: 'tabular-nums'
    }
  }, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 5,
      alignItems: 'center',
      opacity: 0.85
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "11",
    viewBox: "0 0 17 11",
    fill: "var(--ink)"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "6",
    width: "3",
    height: "5",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.5",
    y: "4",
    width: "3",
    height: "7",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "2",
    width: "3",
    height: "9",
    rx: "1"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "13.5",
    y: "0",
    width: "3",
    height: "11",
    rx: "1"
  })), /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "11",
    viewBox: "0 0 25 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "21",
    height: "11",
    rx: "3",
    stroke: "var(--ink)",
    opacity: "0.4"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "16",
    height: "8",
    rx: "1.5",
    fill: "var(--ink)"
  }))));
}
function AppHeader({
  title,
  onBack,
  right,
  brand
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '4px 18px 12px',
      flex: '0 0 auto'
    }
  }, onBack ? /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      width: 32,
      height: 32,
      borderRadius: 999,
      border: 'none',
      background: 'var(--neutral)',
      cursor: 'pointer',
      color: 'var(--ink)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(IconBack, {
    size: 20
  })) : brand ? /*#__PURE__*/React.createElement(KeptConnectLogo, {
    treatment: "app-icon",
    size: 30
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: brand ? 'var(--font-display)' : 'var(--font-ui)',
      fontWeight: 500,
      fontSize: brand ? 17 : 16,
      color: 'var(--ink)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto'
    }
  }, right));
}
function BottomNav({
  tab = 'home',
  onTab
}) {
  const items = [['home', 'Home', IconHome], ['jobs', 'Jobs', IconJobs], ['messages', 'Messages', IconChat], ['you', 'You', IconUser]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 18px 16px',
      borderTop: '1px solid var(--hairline)',
      flex: '0 0 auto',
      background: 'var(--canvas)'
    }
  }, items.map(([id, label, I]) => {
    const on = tab === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => onTab && onTab(id),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        color: on ? 'var(--terracotta)' : 'var(--ink-3)'
      }
    }, /*#__PURE__*/React.createElement(I, {
      size: 22,
      sw: on ? 2.2 : 2
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        fontWeight: 500
      }
    }, label));
  }));
}

/* ---- Home -------------------------------------------------------------- */
const TRADES = [{
  cat: 'water',
  label: 'Plumbing'
}, {
  cat: 'power',
  label: 'Electrical'
}, {
  cat: 'surfaces',
  label: 'Painting'
}, {
  cat: 'grounds',
  label: 'Yard'
}];
function HomeScreen({
  onCompose,
  onOpenJob,
  onTab
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement(AppHeader, {
    brand: true,
    title: "Connect",
    right: /*#__PURE__*/React.createElement(Avatar, {
      name: "Grace Olin",
      size: 30
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '4px 18px 18px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 26,
      lineHeight: 1.15,
      letterSpacing: '-0.01em',
      margin: '12px 2px 14px',
      color: 'var(--ink)'
    }
  }, "What needs doing", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--terracotta)'
    }
  }, "?")), /*#__PURE__*/React.createElement("button", {
    onClick: onCompose,
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'var(--neutral)',
      border: '1px solid var(--hairline)',
      borderRadius: 16,
      padding: '12px 14px',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)',
      fontSize: 14,
      flex: 1
    }
  }, "Describe the job\u2026"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 999,
      background: 'var(--terracotta)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--cream)'
    }
  }, /*#__PURE__*/React.createElement(IconArrow, {
    size: 16,
    sw: 2.2
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      margin: '18px 2px 4px'
    }
  }, TRADES.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.label,
    onClick: onCompose,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      width: 60
    }
  }, /*#__PURE__*/React.createElement(CategoryIcon, {
    category: t.cat,
    size: 48
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'var(--ink-2)'
    }
  }, t.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      width: 60
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 48,
      height: 48,
      borderRadius: 15,
      background: 'var(--neutral)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "var(--ink-2)"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "8",
    r: "1.7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "8",
    r: "1.7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "16",
    r: "1.7"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "16",
    r: "1.7"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: 'var(--ink-2)'
    }
  }, "More"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--ink-3)',
      margin: '20px 4px 9px'
    }
  }, "In progress"), /*#__PURE__*/React.createElement("button", {
    onClick: onOpenJob,
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      background: 'var(--paper)',
      border: '1px solid var(--hairline)',
      borderRadius: 16,
      padding: 12,
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Marco Reyes",
    size: 40,
    status: "enroute"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, "Marco R. ", /*#__PURE__*/React.createElement(VerifiedBadge, {
    size: 14
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-2)',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 9,
      background: 'var(--terracotta)'
    }
  }), " Plumbing \xB7 On the way")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--ink)'
    }
  }, "$120"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)'
    }
  }, "12 min")))), /*#__PURE__*/React.createElement(BottomNav, {
    tab: "home",
    onTab: onTab
  }));
}

/* ---- Composer ---------------------------------------------------------- */
function ComposerScreen({
  onPost,
  onBack
}) {
  const [trade, setTrade] = React.useState('water');
  const [urgency, setUrgency] = React.useState('Same day');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), /*#__PURE__*/React.createElement(AppHeader, {
    title: "Post a job",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 18px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--moment)',
      borderRadius: 'var(--r-lg)',
      padding: '22px 20px',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 28,
      lineHeight: 1.12,
      letterSpacing: '-0.015em',
      margin: 0,
      color: 'var(--ink)'
    }
  }, "What needs doing", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--terracotta)'
    }
  }, "?")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--ink-2)',
      margin: '8px 0 0'
    }
  }, "Describe it once. We'll match you with vetted providers nearby.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "What's the job?",
    multiline: true,
    rows: 3,
    defaultValue: "Kitchen faucet is leaking at the base \u2014 water pooling under the sink."
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontWeight: 500,
      fontSize: 13,
      color: 'var(--ink-2)',
      marginBottom: 8
    }
  }, "Trade"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, TRADES.map(t => {
    const on = trade === t.cat;
    return /*#__PURE__*/React.createElement("button", {
      key: t.cat,
      onClick: () => setTrade(t.cat),
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        padding: '12px 4px',
        borderRadius: 'var(--r-chip)',
        cursor: 'pointer',
        background: on ? 'var(--terracotta-tint)' : 'var(--paper)',
        border: `1.5px solid ${on ? 'var(--terracotta)' : 'var(--hairline)'}`
      }
    }, /*#__PURE__*/React.createElement(CategoryIcon, {
      category: t.cat,
      size: 36
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 500,
        color: on ? 'var(--terracotta-deep)' : 'var(--ink-2)'
      }
    }, t.label));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '12px 14px',
      background: 'var(--paper)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-chip)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--terracotta)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(IconPin, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, "14 Birch Lane"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)'
    }
  }, "Saved property \xB7 Home")), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(IconChevron, {
    size: 18
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontWeight: 500,
      fontSize: 13,
      color: 'var(--ink-2)',
      marginBottom: 8
    }
  }, "When?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 9
    }
  }, ['Whenever', 'Same day', 'Emergency'].map(u => {
    const on = urgency === u;
    return /*#__PURE__*/React.createElement("button", {
      key: u,
      onClick: () => setUrgency(u),
      style: {
        flex: 1,
        padding: '10px 6px',
        borderRadius: 'var(--r-pill)',
        cursor: 'pointer',
        background: on ? 'var(--ink)' : 'var(--paper)',
        border: `1.5px solid ${on ? 'var(--ink)' : 'var(--hairline)'}`,
        color: on ? 'var(--cream)' : 'var(--ink-2)',
        fontFamily: 'var(--font-ui)',
        fontWeight: 500,
        fontSize: 12.5
      }
    }, u);
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderTop: '1px solid var(--hairline)',
      background: 'var(--canvas)',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    size: "lg",
    onClick: onPost
  }, "Post")));
}
Object.assign(window, {
  ReqStatusBar: StatusBar,
  ReqAppHeader: AppHeader,
  ReqBottomNav: BottomNav,
  HomeScreen,
  ComposerScreen,
  REQ_TRADES: TRADES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/requester/ComposerScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/requester/MatchScreen.jsx
try { (() => {
/* Requester app — Live match status (the signature moment) + Quote cards. */
const _DS2 = window.KeptConnectDesignSystem_4a1eb7;
const {
  Button: RBtn,
  Card: RCard,
  Avatar: RAvatar,
  Tag: RTag,
  VerifiedBadge: RVer
} = _DS2;
const PROVIDERS = [{
  name: 'Summit Drywall',
  rating: 4.9,
  jobs: 128,
  price: '295.00',
  eta: 'Can start tomorrow',
  creds: ['Licensed', 'Insured']
}, {
  name: 'A. Vega Finishes',
  rating: 4.8,
  jobs: 74,
  price: '340.00',
  eta: 'This week',
  creds: ['Licensed', 'Background checked']
}, {
  name: 'Peak Interiors',
  rating: 5.0,
  jobs: 41,
  price: '410.00',
  eta: 'Next week',
  creds: ['Insured']
}];
function MatchScreen({
  onResolved,
  onOpen,
  phase
}) {
  const ringStates = phase === 'quotes' ? ['quoted', 'quoted', 'quoted'] : ['responding', 'responding', 'none'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(ReqStatusBar, null), /*#__PURE__*/React.createElement(ReqAppHeader, {
    title: "Live match"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '8px 18px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--moment)',
      borderRadius: 'var(--r-lg)',
      padding: '28px 24px 30px',
      textAlign: 'center',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 28,
      lineHeight: 1.12,
      letterSpacing: '-0.015em',
      margin: 0,
      color: 'var(--ink)'
    }
  }, phase === 'quotes' ? /*#__PURE__*/React.createElement(React.Fragment, null, "3 quotes in") : /*#__PURE__*/React.createElement(React.Fragment, null, "Finding your", /*#__PURE__*/React.createElement("br", null), "provider\u2026")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13.5,
      color: 'var(--ink-2)',
      margin: '10px 0 22px'
    }
  }, phase === 'quotes' ? "Sealed quotes — compare and award." : 'Dispatched to vetted pros near 14 Birch Lane.'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 18
    }
  }, PROVIDERS.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.name,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      opacity: ringStates[i] === 'none' ? 0.4 : 1
    }
  }, /*#__PURE__*/React.createElement(RAvatar, {
    name: p.name,
    size: 46,
    status: ringStates[i]
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--ink-2)',
      fontWeight: 500
    }
  }, p.name.split(' ')[0]))))), phase === 'finding' && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      color: 'var(--ink-3)',
      fontSize: 13,
      padding: '10px 0'
    }
  }, "Usually under 5 minutes. You can close the app \u2014 we'll notify you."), phase === 'quotes' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--ink-3)',
      margin: '2px 4px 10px'
    }
  }, "Sealed quotes \xB7 pick one"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, PROVIDERS.map((p, i) => /*#__PURE__*/React.createElement(QuoteCard, {
    key: p.name,
    p: p,
    best: i === 0,
    onAward: onResolved,
    onOpen: onOpen
  }))))), phase === 'finding' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderTop: '1px solid var(--hairline)',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement(RBtn, {
    fullWidth: true,
    variant: "secondary",
    onClick: onResolved
  }, "Skip ahead (demo)")));
}
function QuoteCard({
  p,
  best,
  onAward,
  onOpen
}) {
  return /*#__PURE__*/React.createElement(RCard, {
    tone: "paper",
    padding: 14,
    lift: best
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11
    }
  }, /*#__PURE__*/React.createElement(RAvatar, {
    name: p.name,
    size: 42
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      fontSize: 14.5,
      color: 'var(--ink)'
    }
  }, p.name), /*#__PURE__*/React.createElement(RVer, {
    size: 14
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
      color: 'var(--ink-2)',
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement(IconStar, {
    size: 12,
    style: {
      color: 'var(--terracotta)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, p.rating), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)'
    }
  }, "\xB7 ", p.jobs, " jobs")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 500,
      color: 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, "$", p.price), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--ink-3)',
      marginTop: 1
    }
  }, p.eta)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(RBtn, {
    variant: "ghost",
    size: "sm",
    onClick: onOpen
  }, "Profile"), /*#__PURE__*/React.createElement(RBtn, {
    variant: best ? 'primary' : 'outline',
    size: "sm",
    onClick: onAward
  }, "Award"))));
}
Object.assign(window, {
  MatchScreen,
  QuoteCard,
  REQ_PROVIDERS: PROVIDERS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/requester/MatchScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/requester/ProfileScreen.jsx
try { (() => {
/* Requester app — Provider profile (trust surface) + Track (the live job). */
const _DS3 = window.KeptConnectDesignSystem_4a1eb7;
const {
  Button: PBtn,
  Card: PCard,
  Avatar: PAvatar,
  Tag: PTag,
  VerifiedBadge: PVer
} = _DS3;
function Stat({
  value,
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      padding: '4px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 19,
      fontWeight: 500,
      color: 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      marginTop: 2
    }
  }, label));
}
function SectionLabel({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--ink-3)',
      fontWeight: 500,
      marginBottom: 9
    }
  }, children);
}
function ProfileScreen({
  onBack,
  onAward
}) {
  const reviews = [{
    name: 'Priya N.',
    when: '2 weeks ago',
    text: 'Fixed a stubborn leak fast and left the cabinet cleaner than he found it. Walked me through what went wrong.'
  }, {
    name: 'Theo V.',
    when: 'last month',
    text: 'On time, clear quote, no upsell. Exactly what you want when a stranger is in your home.'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(ReqStatusBar, null), /*#__PURE__*/React.createElement(ReqAppHeader, {
    title: "Provider",
    onBack: onBack,
    right: /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ink-3)',
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement(IconChat, null))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      paddingBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--moment)',
      padding: '8px 22px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(PAvatar, {
    name: "Summit Drywall",
    size: 66,
    status: "quoted"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 22,
      color: 'var(--ink)',
      letterSpacing: '-0.01em'
    }
  }, "Summit Drywall"), /*#__PURE__*/React.createElement(PVer, {
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 4,
      fontSize: 14,
      color: 'var(--ink-2)'
    }
  }, /*#__PURE__*/React.createElement(IconStar, {
    size: 14,
    style: {
      color: 'var(--terracotta)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      color: 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, "4.9"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)'
    }
  }, "\xB7 128 jobs")))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px'
    }
  }, /*#__PURE__*/React.createElement(PCard, {
    tone: "paper",
    padding: 4,
    style: {
      display: 'flex',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "128",
    label: "Jobs done"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      background: 'var(--hairline)',
      margin: '10px 0'
    }
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "4.9",
    label: "Rating"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      background: 'var(--hairline)',
      margin: '10px 0'
    }
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "5 yr",
    label: "On Kept"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Verified credentials"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(PTag, {
    icon: /*#__PURE__*/React.createElement(IconCheck, {
      size: 12
    })
  }, "Licensed"), /*#__PURE__*/React.createElement(PTag, {
    icon: /*#__PURE__*/React.createElement(IconCheck, {
      size: 12
    })
  }, "Insured"), /*#__PURE__*/React.createElement(PTag, {
    icon: /*#__PURE__*/React.createElement(IconCheck, {
      size: 12
    })
  }, "Background checked"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "Trades"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(PTag, {
    variant: "trade"
  }, "Drywall"), /*#__PURE__*/React.createElement(PTag, {
    variant: "trade"
  }, "Plaster"), /*#__PURE__*/React.createElement(PTag, {
    variant: "trade"
  }, "Texture & finish"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "Reviews"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, reviews.map(r => /*#__PURE__*/React.createElement(PCard, {
    key: r.name,
    tone: "paper",
    padding: 14
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 7
    }
  }, /*#__PURE__*/React.createElement(PAvatar, {
    name: r.name,
    size: 28
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, r.name), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 1
    }
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement(IconStar, {
    key: i,
    size: 12,
    style: {
      color: 'var(--terracotta)'
    }
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13.5,
      color: 'var(--ink-2)',
      lineHeight: 1.5
    }
  }, r.text), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 11,
      color: 'var(--ink-3)'
    }
  }, r.when))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px',
      borderTop: '1px solid var(--hairline)',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)'
    }
  }, "Sealed quote"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 500,
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--ink)'
    }
  }, "$295.00")), /*#__PURE__*/React.createElement(PBtn, {
    size: "lg",
    style: {
      flex: 1
    },
    onClick: onAward
  }, "Award")));
}

/* ---- Track (replaces a static confirmation — the live job) ------------- */
function TrackScreen({
  onBack,
  onTab,
  onMessage,
  onRate
}) {
  const steps = [['Requested', true], ['Matched with Marco', true], ['On the way', true], ['Job complete', false]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(ReqStatusBar, null), /*#__PURE__*/React.createElement(ReqAppHeader, {
    title: "Your plumber",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '0 18px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 160,
      borderRadius: 18,
      overflow: 'hidden',
      border: '1px solid var(--hairline)',
      margin: '0 0 6px'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 280 160",
    preserveAspectRatio: "xMidYMid slice",
    style: {
      display: 'block',
      width: '100%',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("rect", {
    width: "280",
    height: "160",
    fill: "#F1EFEA"
  }), /*#__PURE__*/React.createElement("g", {
    stroke: "#E4E1D9",
    strokeWidth: "6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M-10 44 H290"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-10 112 H290"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M70 -10 V170"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M200 -10 V170"
  })), /*#__PURE__*/React.createElement("path", {
    d: "M70 112 L70 64 L200 64 L200 44",
    fill: "none",
    stroke: "var(--terracotta)",
    strokeWidth: "4",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "70",
    cy: "112",
    r: "7",
    fill: "var(--terracotta)",
    stroke: "#fff",
    strokeWidth: "3"
  }), /*#__PURE__*/React.createElement("g", {
    transform: "translate(200 44)"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 6 C0 6 8 0 8 -6 A8 8 0 1 0 -8 -6 C-8 0 0 6 0 6 z",
    fill: "var(--ink)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "0",
    cy: "-6",
    r: "3",
    fill: "#fff"
  })))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 24,
      margin: '10px 2px 2px',
      letterSpacing: '-0.01em',
      color: 'var(--ink)'
    }
  }, "On the way", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--terracotta)'
    }
  }, ".")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--ink-2)',
      margin: '0 2px 14px'
    }
  }, "Arriving in about 12 minutes"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      border: '1px solid var(--hairline)',
      borderRadius: 16,
      padding: 12
    }
  }, /*#__PURE__*/React.createElement(PAvatar, {
    name: "Marco Reyes",
    size: 42,
    status: "enroute"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--ink)'
    }
  }, "Marco R. ", /*#__PURE__*/React.createElement(PVer, {
    size: 14
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-2)',
      marginTop: 1
    }
  }, "Plumbing \xB7 Licensed \xB7 Insured")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onMessage,
    "aria-label": "Call",
    style: {
      width: 38,
      height: 38,
      borderRadius: 999,
      background: 'var(--neutral)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--ink)',
      border: 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(IconPhone, {
    size: 18
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onMessage,
    "aria-label": "Message",
    style: {
      width: 38,
      height: 38,
      borderRadius: 999,
      background: 'var(--neutral)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--ink)',
      border: 'none',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(IconChat, {
    size: 18
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      margin: '16px 4px 0'
    }
  }, steps.map(([label, done]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 13,
      padding: '5px 0',
      color: done ? 'var(--ink)' : 'var(--ink-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 11,
      height: 11,
      borderRadius: 999,
      flex: '0 0 auto',
      background: done ? 'var(--terracotta)' : 'transparent',
      border: `2px solid ${done ? 'var(--terracotta)' : 'var(--ink-3)'}`
    }
  }), label))), /*#__PURE__*/React.createElement(PBtn, {
    variant: "outline",
    fullWidth: true,
    size: "md",
    style: {
      marginTop: 18
    },
    onClick: onRate
  }, "Job done? Rate Marco")), /*#__PURE__*/React.createElement(ReqBottomNav, {
    tab: "jobs",
    onTab: onTab
  }));
}
Object.assign(window, {
  ProfileScreen,
  TrackScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/requester/ProfileScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/requester/ThreadScreen.jsx
try { (() => {
/* Requester app — Masked thread (§3.4, job-scoped comms, no raw contact)
   and Ratings (§3.5, one-tap stars, a warm confirmation moment). */
const _DS4 = window.KeptConnectDesignSystem_4a1eb7;
const {
  Button: MBtn,
  Avatar: MAvatar,
  VerifiedBadge: MVer,
  Input: MInput
} = _DS4;

/* ---- Masked thread ----------------------------------------------------- */
function ThreadScreen({
  onBack
}) {
  const msgs = [{
    from: 'them',
    text: "Hi! On my way — about 12 minutes out. I'll text when I'm parked.",
    time: '1:48 PM'
  }, {
    from: 'me',
    text: 'Great, thanks. The leak is under the kitchen sink, cabinet on the left.',
    time: '1:49 PM'
  }, {
    from: 'them',
    photo: true,
    text: 'Found it — the supply line fitting is cracked. Easy fix, I have the part.',
    time: '2:06 PM'
  }, {
    from: 'me',
    text: 'Amazing. Go ahead.',
    time: '2:07 PM'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement(ReqStatusBar, null), /*#__PURE__*/React.createElement(ReqAppHeader, {
    title: "Marco R.",
    onBack: onBack,
    right: /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ink)',
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement(IconPhone, null))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 18px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'var(--neutral)',
      borderRadius: 'var(--r-chip)',
      padding: '9px 12px',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 9,
      background: 'var(--terracotta)',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'var(--ink-2)'
    }
  }, "Leak under kitchen sink \xB7 14 Birch Lane"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 11,
      color: 'var(--ink-3)'
    }
  }, "Contact stays private")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '6px 18px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, msgs.map((m, i) => {
    const me = m.from === 'me';
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: me ? 'flex-end' : 'flex-start',
        gap: 4
      }
    }, m.photo && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 150,
        height: 104,
        borderRadius: 14,
        background: 'var(--neutral)',
        border: '1px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ink-3)'
      }
    }, /*#__PURE__*/React.createElement(IconCam, {
      size: 26
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: '78%',
        padding: '10px 13px',
        borderRadius: 16,
        fontSize: 14,
        lineHeight: 1.45,
        background: me ? 'var(--terracotta)' : 'var(--paper)',
        color: me ? 'var(--cream)' : 'var(--ink)',
        border: me ? 'none' : '1px solid var(--hairline)',
        borderBottomRightRadius: me ? 5 : 16,
        borderBottomLeftRadius: me ? 16 : 5
      }
    }, m.text), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        color: 'var(--ink-3)',
        padding: '0 4px'
      }
    }, m.time));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 18px 16px',
      borderTop: '1px solid var(--hairline)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flex: '0 0 auto',
      background: 'var(--canvas)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 999,
      background: 'var(--neutral)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--ink-2)',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement(IconCam, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      background: 'var(--paper)',
      border: '1px solid var(--hairline)',
      borderRadius: 'var(--r-pill)',
      padding: '0 6px 0 14px',
      height: 44
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 14,
      color: 'var(--ink-3)'
    }
  }, "Message\u2026"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 999,
      background: 'var(--terracotta)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--cream)'
    }
  }, /*#__PURE__*/React.createElement(IconArrow, {
    size: 16,
    sw: 2.2
  })))));
}

/* ---- Ratings ----------------------------------------------------------- */
function RatingScreen({
  onDone
}) {
  const [stars, setStars] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  if (submitted) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--moment)'
      }
    }, /*#__PURE__*/React.createElement(ReqStatusBar, null), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "72",
      height: "72",
      viewBox: "0 0 24 24",
      fill: "none"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "11",
      fill: "var(--terracotta)"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M7 12.4 L10.6 16 L17 8.6",
      stroke: "var(--cream)",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 500,
        fontSize: 34,
        margin: 0,
        letterSpacing: '-0.015em',
        color: 'var(--ink)'
      }
    }, "Thanks", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--terracotta)'
      }
    }, ".")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 15,
        color: 'var(--ink-2)',
        margin: '12px 0 0',
        lineHeight: 1.5,
        maxWidth: 260
      }
    }, "Your rating helps keep the network trustworthy for everyone.")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 18px 24px',
        flex: '0 0 auto'
      }
    }, /*#__PURE__*/React.createElement(MBtn, {
      fullWidth: true,
      size: "lg",
      onClick: onDone
    }, "Back to home")));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--moment)'
    }
  }, /*#__PURE__*/React.createElement(ReqStatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 28px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(MAvatar, {
    name: "Marco Reyes",
    size: 72,
    status: "awarded"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 500,
      fontSize: 28,
      margin: '18px 0 0',
      letterSpacing: '-0.015em',
      color: 'var(--ink)'
    }
  }, "How was Marco?"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--ink-2)',
      margin: '8px 0 0'
    }
  }, "Leak under kitchen sink \xB7 done in 38 min"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      margin: '24px 0 20px'
    }
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => setStars(n),
    "aria-label": `${n} stars`,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 2,
      color: n <= stars ? 'var(--terracotta)' : 'var(--ink-3)',
      opacity: n <= stars ? 1 : 0.4
    }
  }, /*#__PURE__*/React.createElement(IconStar, {
    size: 36
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 320
    }
  }, /*#__PURE__*/React.createElement(MInput, {
    multiline: true,
    rows: 2,
    placeholder: "Add a note (optional)"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px 24px',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement(MBtn, {
    fullWidth: true,
    size: "lg",
    disabled: stars === 0,
    onClick: () => setSubmitted(true)
  }, "Submit rating")));
}
Object.assign(window, {
  ThreadScreen,
  RatingScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/requester/ThreadScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/requester/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Requester app — icon set.
   These are the brand's OWN glyphs, lifted from the Kept Connect design
   explorations (terracotta × Uber + category systems). Monochrome line,
   2px stroke, round caps/joins — they inherit currentColor. Trade/category
   glyphs live in the CategoryIcon component; these are the UI affordances. */
const Ic = ({
  d,
  size = 22,
  sw = 2,
  fill = 'none',
  children,
  ...p
}) => /*#__PURE__*/React.createElement("svg", _extends({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: fill,
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, p), d ? /*#__PURE__*/React.createElement("path", {
  d: d
}) : children);
const IconHome = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("path", {
  d: "M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"
}));
const IconJobs = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("rect", {
  x: "6",
  y: "4",
  width: "12",
  height: "17",
  rx: "2.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 4.5h6v2.5H9z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 11h6M9 15h4"
}));
const IconChat = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1z"
}));
const IconUser = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "8.5",
  r: "3.5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5.5 20a6.5 6.5 0 0 1 13 0"
}));
const IconArrow = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 12h13M13 6l6 6-6 6"
}));
const IconBack = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("path", {
  d: "M14 6l-6 6 6 6"
}));
const IconChevron = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("path", {
  d: "M9 6l6 6-6 6"
}));
const IconPhone = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("path", {
  d: "M6 4h3l1.6 4-2 1.2c.9 2.3 2.5 3.9 4.8 4.8l1.2-2 4 1.6V17c0 .6-.4 1-1 1C11.3 18 6 12.7 6 6c0-.6.4-1 1-1z"
}));
const IconStar = p => /*#__PURE__*/React.createElement(Ic, _extends({}, p, {
  fill: "currentColor",
  stroke: "none"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 4l2.3 5.2 5.7.6-4.2 3.8 1.2 5.6-5-3-5 3 1.2-5.6L3.8 9.8l5.7-.6z"
}));
const IconCheck = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("path", {
  d: "M5 12.5 10 17 19 6.5"
}));
const IconCam = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("rect", {
  x: "3.5",
  y: "7",
  width: "17",
  height: "12",
  rx: "2.5"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "13",
  r: "3.2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 7l1.2-2h3.6L15 7"
}));
const IconPin = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("path", {
  d: "M12 21s-6.5-5.6-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.4 12 21 12 21z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "10.6",
  r: "2.3"
}));
const IconClock = p => /*#__PURE__*/React.createElement(Ic, p, /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "8.2"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 7.6v4.6l3 1.8"
}));
Object.assign(window, {
  IconHome,
  IconJobs,
  IconChat,
  IconUser,
  IconArrow,
  IconBack,
  IconChevron,
  IconPhone,
  IconStar,
  IconCheck,
  IconCam,
  IconPin,
  IconClock
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/requester/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.KeptConnectLogo = __ds_scope.KeptConnectLogo;

__ds_ns.CATEGORIES = __ds_scope.CATEGORIES;

__ds_ns.CategoryIcon = __ds_scope.CategoryIcon;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.VerifiedBadge = __ds_scope.VerifiedBadge;

})();
