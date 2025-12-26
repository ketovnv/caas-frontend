// ============================================================================
// OKLCH Color System
// ============================================================================

/** OKLCH color tuple: [Lightness 0-1, Chroma 0-0.4, Hue 0-360] */
export type OklchTuple = [number, number, number];

/** Convert OKLCH tuple to CSS string */
export const oklchToString = (c: OklchTuple): string =>
  `oklch(${c[0].toFixed(3)} ${c[1].toFixed(3)} ${c[2].toFixed(1)})`;

/** Gradient config: [colors, x%, y%, steps] for radial gradient */
export type GradientConfig = [OklchTuple[], number, number, number];

// ============================================================================
// Theme Configuration
// ============================================================================

export interface ThemeConfig {
  // Text colors
  color: OklchTuple;
  accentColor: OklchTuple;

  // Gradients (4 colors + position + steps)
  backgroundGradient: GradientConfig;
  buttonGradient: GradientConfig;

  // Shadows (keep as string - not animatable in OKLCH)
  boxShadow: string;

  // Button text gradients
  buttonTextColors: OklchTuple[];
  buttonActiveTextColors: OklchTuple[];

  // NavBar
  navBarButtonBackground: OklchTuple;
  navBarButtonTextColors: OklchTuple[];
  navBarButtonActiveTextColors: OklchTuple[];
}

// ============================================================================
// Dark Theme
// ============================================================================

export const STANDART_DARK: ThemeConfig = {
  color: [0.991, 0.001, 0],
  accentColor: [0.59, 0.222, 263.9],
  boxShadow: '2px 1px rgba(0, 150, 150, 0.05)',

  backgroundGradient: [
    [
      [0.011, 0.111, 200],    // deep cyan
      [0.01, 0.113, 200],     // deep cyan
      [0.01, 0.011, 0],       // near black
      [0.01, 0.013, 264],     // deep purple hint
    ],
    -30, -15, 16  // x%, y%, steps (for CSS, not spread)
  ],

  buttonGradient: [
    [
      [0.121, 0.001, 235],    // dark blue-gray
      [0.001, 0.001, 0],      // near black
      [0.001, 0.001, 0],      // near black
      [0.139, 0.019, 259.66], // dark purple hint
    ],
    100, 50, 8
  ],

  buttonTextColors: [
    [0.772, 0.131, 205.58],  // cyan
    [0.613, 0.150, 263.91],  // purple
    [0.938, 0.095, 195.64],  // light cyan
    [0.452, 0.101, 250.05],  // muted purple
  ],

  buttonActiveTextColors: [
    [0.968, 0.211, 109.77],  // yellow
    [0.978, 0.124, 108.51],  // light yellow
    [0.845, 0.001, 0],       // light gray
    [0.991, 0.044, 107.18],  // cream
  ],

  navBarButtonBackground: [0.652, 0.313, 264.05],

  navBarButtonTextColors: [
    [0.772, 0.231, 235.58],
    [0.613, 0.208, 263.91],
    [0.938, 0.295, 195.64],
    [0.452, 0.235, 235.05],
  ],

  navBarButtonActiveTextColors: [
    [0.935, 0.211, 109.77],
    [0.978, 0.124, 108.51],
    [0.691, 0.171, 64.59],
    [0.991, 0.044, 107.18],
  ],
};

// ============================================================================
// Light Theme
// ============================================================================

export const STANDART_LIGHT: ThemeConfig = {
  color: [0.001, 0.001, 0],
  accentColor: [0.421, 0.208, 263.91],
  boxShadow: '2px 1px rgba(0, 0, 0, 0.15)',

  backgroundGradient: [
    [
      [0.991, 0.011, 0],      // near white
      [0.881, 0.011, 235],    // light blue tint
      [0.991, 0.011, 0],      // near white
      [0.861, 0.012, 250],    // light purple tint
    ],
    -300, -125, 16
  ],

  buttonGradient: [
    [
      [0.892, 0.078, 89.68],  // warm yellow
      [0.974, 0.037, 107.06], // cream
      [0.964, 0.119, 108.44], // golden
      [0.995, 0.023, 106.82], // near white warm
    ],
    0, 250, 8
  ],

  buttonTextColors: [
    [0.203, 0.141, 264.05],
    [0.613, 0.208, 263.90],
    [0.471, 0.299, 264.51],
    [0.478, 0.201, 262.01],
  ],

  buttonActiveTextColors: [
    [0.675, 0.217, 38.80],
    [0.594, 0.168, 45.48],
    [0.933, 0.197, 104.32],
    [0.627, 0.135, 70.15],
  ],

  navBarButtonBackground: [0.252, 0.313, 264.05],

  navBarButtonTextColors: [
    [0.272, 0.231, 235.58],
    [0.413, 0.208, 263.91],
    [0.138, 0.295, 195.64],
    [0.200, 0.235, 235.05],
  ],

  navBarButtonActiveTextColors: [
    [0.555, 0.211, 109.77],
    [0.478, 0.124, 108.51],
    [0.691, 0.171, 64.59],
    [0.591, 0.440, 107.18],
  ],
};

// ============================================================================
// Preset Gradients (as OKLCH tuples)
// ============================================================================

export const SPECTRAL_GRADIENT: OklchTuple[] = [
  [0.63, 0.258, 29.23],    // red-orange
  [0.68, 0.217, 38.80],    // orange
  [0.80, 0.171, 73.27],    // yellow-green
  [0.97, 0.211, 109.77],   // yellow
  [0.86, 0.211, 132.94],   // green
  [0.69, 0.025, 285.73],   // gray-purple
  [0.67, 0.180, 250.47],   // blue
  [0.45, 0.311, 265.26],   // deep purple
  [0.56, 0.296, 301.91],   // violet
  [0.70, 0.323, 328.36],   // magenta
  [0.65, 0.268, 354.75],   // red
];

export const RAINBOW_GRADIENT: OklchTuple[] = [
  [0.63, 0.29, 29],    // red
  [0.70, 0.20, 50],    // orange
  [0.85, 0.20, 85],    // yellow
  [0.87, 0.30, 142],   // green
  [0.75, 0.18, 195],   // cyan
  [0.62, 0.26, 265],   // blue
  [0.55, 0.30, 305],   // purple
  [0.65, 0.30, 330],   // magenta
];

export const GRAY_GRADIENT: OklchTuple[] = [
  [0.10, 0, 0],
  [0.20, 0, 0],
  [0.30, 0, 0],
  [0.40, 0, 0],
  [0.50, 0, 0],
  [0.60, 0, 0],
  [0.70, 0, 0],
  [0.80, 0, 0],
  [0.90, 0, 0],
  [1.00, 0, 0],
];

// ============================================================================
// Utility Gradients
// ============================================================================

export const RED_GRADIENT_DARK: OklchTuple[] = [
  [0.40, 0.20, 15],   // dark red
  [0.60, 0.25, 30],   // red-orange
  [0.35, 0.18, 25],   // dark red-brown
  [0.25, 0.15, 20],   // deep red
];

export const RED_GRADIENT_LIGHT: OklchTuple[] = [
  [0.75, 0.15, 10],   // pink
  [0.70, 0.20, 25],   // coral
  [0.75, 0.15, 10],   // pink
  [0.65, 0.22, 20],   // red
];

// Legacy exports (deprecated - use OKLCH versions)
export const redGradientDark = RED_GRADIENT_DARK.map(oklchToString);
export const redGradientLight = RED_GRADIENT_LIGHT.map(oklchToString);

// Legacy aliases for backwards compatibility
export const RAINBOWGRADIENT = RAINBOW_GRADIENT.map(oklchToString);
export const RAINBOWGRADIENT2 = RAINBOW_GRADIENT.map(oklchToString);
export const SPECTRALGRADIENTOKLCH = SPECTRAL_GRADIENT.map(oklchToString);
export const HEXCOLORSGRADIENT = GRAY_GRADIENT.map(oklchToString);
