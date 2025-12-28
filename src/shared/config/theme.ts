// OKLCH Color System

import type { OklchTuple } from 'shared/lib/gradient';

// Re-export for convenience
export type { OklchTuple };

/** Convert OKLCH tuple to CSS string */
export const oklchToString = (c: OklchTuple): string =>
  `oklch(${c[0].toFixed(3)} ${c[1].toFixed(3)} ${c[2].toFixed(1)})`;

/** Gradient config: [colors, x%, y%, steps] for radial gradient */
export type GradientConfig = [OklchTuple[], number, number, number];


// Theme Configuration


export interface ThemeConfig {
  // Text colors
  color: OklchTuple;
  accentColor: OklchTuple;
  goldColor: OklchTuple;

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

// Dark Theme

export const STANDART_DARK: ThemeConfig = {
  color: [0.991, 0.001, 0],              // oklch(0.991 0.001 0) - near white
  accentColor: [0.59, 0.222, 263.9],     // oklch(0.59 0.222 263.9) - purple accent
  goldColor: [0.945, 0.129, 101.6],      // oklch(0.945 0.129 101.6) - gold
  boxShadow: '2px 1px rgba(0, 150, 150, 0.05)',

  backgroundGradient: [
    [
      [0.01, 0.111, 200],    // oklch(0.01 0.111 200) - deep blue-black
      [0.1, 0.05, 200],      // oklch(0.1 0.05 200) - dark blue
      [0.01, 0.011, 0],      // oklch(0.01 0.011 0) - near black
      [0.2, 0.013, 264],     // oklch(0.2 0.013 264) - dark purple
    ],
    -30, -15, 16  // x%, y%, steps (for CSS, not spread)
  ],

  buttonGradient: [
    [
      [0.121, 0.001, 235],      // oklch(0.121 0.001 235) - dark blue-gray
      [0.001, 0.001, 0],        // oklch(0.001 0.001 0) - black
      [0.001, 0.001, 0],        // oklch(0.001 0.001 0) - black
      [0.139, 0.019, 259.66],   // oklch(0.139 0.019 259.66) - dark purple
    ],
    100, 50, 8
  ],

  buttonTextColors: [
    [0.772, 0.131, 205.58],   // oklch(0.772 0.131 205.58) - cyan
    [0.613, 0.150, 263.91],   // oklch(0.613 0.150 263.91) - blue-purple
    [0.938, 0.095, 195.64],   // oklch(0.938 0.095 195.64) - light cyan
    [0.452, 0.101, 250.05],   // oklch(0.452 0.101 250.05) - blue
  ],

  buttonActiveTextColors: [
    [0.968, 0.211, 109.77],   // oklch(0.968 0.211 109.77) - bright yellow
    [0.978, 0.124, 108.51],   // oklch(0.978 0.124 108.51) - yellow
    [0.845, 0.001, 0],        // oklch(0.845 0.001 0) - light gray
    [0.991, 0.044, 107.18],   // oklch(0.991 0.044 107.18) - pale yellow
  ],

  navBarButtonBackground: [0.652, 0.313, 264.05],   // oklch(0.652 0.313 264.05) - vibrant purple

  navBarButtonTextColors: [
    [0.772, 0.231, 235.58],   // oklch(0.772 0.231 235.58) - bright cyan
    [0.613, 0.208, 263.91],   // oklch(0.613 0.208 263.91) - purple
    [0.938, 0.295, 195.64],   // oklch(0.938 0.295 195.64) - bright cyan
    [0.452, 0.235, 235.05],   // oklch(0.452 0.235 235.05) - blue
  ],

  navBarButtonActiveTextColors: [
    [0.935, 0.211, 109.77],   // oklch(0.935 0.211 109.77) - bright yellow
    [0.978, 0.124, 108.51],   // oklch(0.978 0.124 108.51) - yellow
    [0.691, 0.171, 64.59],    // oklch(0.691 0.171 64.59) - orange
    [0.991, 0.044, 107.18],   // oklch(0.991 0.044 107.18) - pale yellow
  ],
};

// Light Theme

export const STANDART_LIGHT: ThemeConfig = {
  color: [0.001, 0.001, 0],              // oklch(0.001 0.001 0) - black
  accentColor: [0.421, 0.208, 263.91],   // oklch(0.421 0.208 263.91) - dark purple
  goldColor: [0.645, 0.129, 101.6],      // oklch(0.645 0.129 101.6) - dark gold
  boxShadow: '2px 1px rgba(0, 0, 0, 0.15)',

  backgroundGradient: [
    [
      [0.991, 0.011, 0],     // oklch(0.991 0.011 0) - near white
      [0.859, 0.011, 235],   // oklch(0.859 0.011 235) - light gray-blue
      [0.991, 0.011, 0],     // oklch(0.991 0.011 0) - near white
      [0.561, 0.012, 250],   // oklch(0.561 0.012 250) - gray-blue
    ],
    100, -15, 16
  ],

  buttonGradient: [
    [
      [0.892, 0.078, 89.68],    // oklch(0.892 0.078 89.68) - light yellow
      [0.974, 0.037, 107.06],   // oklch(0.974 0.037 107.06) - pale yellow
      [0.964, 0.119, 108.44],   // oklch(0.964 0.119 108.44) - bright pale yellow
      [0.995, 0.023, 106.82],   // oklch(0.995 0.023 106.82) - near white yellow
    ],
    0, 250, 8
  ],

  buttonTextColors: [
    [0.203, 0.141, 264.05],   // oklch(0.203 0.141 264.05) - dark purple
    [0.613, 0.208, 263.90],   // oklch(0.613 0.208 263.90) - purple
    [0.471, 0.299, 264.51],   // oklch(0.471 0.299 264.51) - vibrant purple
    [0.478, 0.201, 262.01],   // oklch(0.478 0.201 262.01) - blue-purple
  ],

  buttonActiveTextColors: [
    [0.675, 0.217, 38.80],    // oklch(0.675 0.217 38.80) - orange
    [0.594, 0.168, 45.48],    // oklch(0.594 0.168 45.48) - orange-yellow
    [0.933, 0.197, 104.32],   // oklch(0.933 0.197 104.32) - bright yellow
    [0.627, 0.135, 70.15],    // oklch(0.627 0.135 70.15) - yellow-orange
  ],

  navBarButtonBackground: [0.252, 0.313, 264.05],   // oklch(0.252 0.313 264.05) - dark vibrant purple

  navBarButtonTextColors: [
    [0.272, 0.231, 235.58],   // oklch(0.272 0.231 235.58) - dark cyan-blue
    [0.413, 0.208, 263.91],   // oklch(0.413 0.208 263.91) - purple
    [0.138, 0.295, 195.64],   // oklch(0.138 0.295 195.64) - dark vibrant cyan
    [0.200, 0.235, 235.05],   // oklch(0.200 0.235 235.05) - dark blue
  ],

  navBarButtonActiveTextColors: [
    [0.555, 0.211, 109.77],   // oklch(0.555 0.211 109.77) - yellow-green
    [0.478, 0.124, 108.51],   // oklch(0.478 0.124 108.51) - olive
    [0.691, 0.171, 64.59],    // oklch(0.691 0.171 64.59) - orange
    [0.591, 0.440, 107.18],   // oklch(0.591 0.440 107.18) - vibrant yellow
  ],
};


// Preset Gradients (as OKLCH tuples)


export const SPECTRAL_GRADIENT: OklchTuple[] = [
  [0.63, 0.258, 29.23],    // oklch(0.63 0.258 29.23) - red-orange
  [0.68, 0.217, 38.80],    // oklch(0.68 0.217 38.80) - orange
  [0.80, 0.171, 73.27],    // oklch(0.80 0.171 73.27) - yellow-green
  [0.97, 0.211, 109.77],   // oklch(0.97 0.211 109.77) - yellow
  [0.86, 0.211, 132.94],   // oklch(0.86 0.211 132.94) - green
  [0.69, 0.025, 285.73],   // oklch(0.69 0.025 285.73) - gray-purple
  [0.67, 0.180, 250.47],   // oklch(0.67 0.180 250.47) - blue
  [0.45, 0.311, 265.26],   // oklch(0.45 0.311 265.26) - deep purple
  [0.56, 0.296, 301.91],   // oklch(0.56 0.296 301.91) - violet
  [0.70, 0.323, 328.36],   // oklch(0.70 0.323 328.36) - magenta
  [0.65, 0.268, 354.75],   // oklch(0.65 0.268 354.75) - red
];

export const RAINBOWGRADIENT: OklchTuple[] = [
  [0.63, 0.29, 10],     // oklch(0.63 0.29 10) - red
  [0.65, 0.28, 20],     // oklch(0.65 0.28 20) - red-orange
  [0.67, 0.27, 30],     // oklch(0.67 0.27 30) - orange-red
  [0.70, 0.25, 40],     // oklch(0.70 0.25 40) - orange
  [0.73, 0.23, 50],     // oklch(0.73 0.23 50) - yellow-orange
  [0.76, 0.21, 60],      // oklch(0.76 0.21 60) - orange-yellow
  [0.80, 0.22, 70],      // oklch(0.80 0.22 70) - yellow-orange
  [0.83, 0.23, 80],    // oklch(0.83 0.23 80) - yellow
  [0.86, 0.24, 90],    // oklch(0.86 0.24 90) - yellow
  [0.88, 0.25, 100],   // oklch(0.88 0.25 100) - yellow-green
  [0.89, 0.26, 110],   // oklch(0.89 0.26 110) - yellow-green
  [0.90, 0.27, 120],   // oklch(0.90 0.27 120) - lime
  [0.89, 0.28, 130],   // oklch(0.89 0.28 130) - lime-green
  [0.87, 0.29, 140],   // oklch(0.87 0.29 140) - green
  [0.85, 0.28, 150],   // oklch(0.85 0.28 150) - green
  [0.82, 0.26, 160],   // oklch(0.82 0.26 160) - green-cyan
  [0.80, 0.24, 170],   // oklch(0.80 0.24 170) - spring green
  [0.78, 0.22, 180],   // oklch(0.78 0.22 180) - cyan-green
  [0.76, 0.20, 190],   // oklch(0.76 0.20 190) - cyan
  [0.74, 0.19, 200],   // oklch(0.74 0.19 200) - cyan
  [0.71, 0.20, 210],     // oklch(0.71 0.20 210) - cyan-blue
  [0.68, 0.22, 220],   // oklch(0.68 0.22 220) - light blue
  [0.65, 0.24, 230],   // oklch(0.65 0.24 230) - sky blue
  [0.62, 0.26, 240],   // oklch(0.62 0.26 240) - blue
  [0.60, 0.27, 250],   // oklch(0.60 0.27 250) - blue
  [0.58, 0.28, 260],   // oklch(0.58 0.28 260) - deep blue
  [0.56, 0.29, 270],   // oklch(0.56 0.29 270) - blue-purple
  [0.57, 0.30, 280],   // oklch(0.57 0.30 280) - purple
  [0.59, 0.30, 290],   // oklch(0.59 0.30 290) - purple
  [0.61, 0.29, 300],   // oklch(0.61 0.29 300) - purple-magenta
  [0.63, 0.28, 310],   // oklch(0.63 0.28 310) - magenta
  [0.65, 0.28, 320],   // oklch(0.65 0.28 320) - magenta-pink
  [0.66, 0.29, 330],   // oklch(0.66 0.29 330) - pink-magenta
  [0.65, 0.29, 340],   // oklch(0.65 0.29 340) - pink-red
  [0.64, 0.29, 350],   // oklch(0.64 0.29 350) - red-pink
  [0.63, 0.29, 360],   // oklch(0.63 0.29 360) - red
];

export const RAINBOW_GRADIENT_V2: OklchTuple[] = [
  [0.63, 0.26, 29],    // oklch(0.63 0.26 29) - red
  [0.69, 0.24, 45],    // oklch(0.69 0.24 45) - orange-red
  [0.78, 0.20, 65],    // oklch(0.78 0.20 65) - orange
  [0.97, 0.21, 110],   // oklch(0.97 0.21 110) - yellow
  [0.93, 0.26, 125],   // oklch(0.93 0.26 125) - lime-yellow
  [0.88, 0.29, 133],   // oklch(0.88 0.29 133) - lime
  [0.87, 0.29, 142],   // oklch(0.87 0.29 142) - green
  [0.88, 0.26, 158],   // oklch(0.88 0.26 158) - spring green
  [0.88, 0.21, 175],   // oklch(0.88 0.21 175) - cyan-green
  [0.91, 0.15, 195],   // oklch(0.91 0.15 195) - cyan
  [0.73, 0.18, 230],   // oklch(0.73 0.18 230) - sky blue
  [0.59, 0.22, 250],   // oklch(0.59 0.22 250) - blue
  [0.45, 0.31, 265],   // oklch(0.45 0.31 265) - deep blue
  [0.48, 0.31, 285],   // oklch(0.48 0.31 285) - purple
  [0.54, 0.30, 305],   // oklch(0.54 0.30 305) - purple-magenta
  [0.60, 0.32, 328],   // oklch(0.60 0.32 328) - magenta
];

export const GRAY_GRADIENT: OklchTuple[] = [
  [0.10, 0, 0],   // oklch(0.10 0 0) - near black
  [0.20, 0, 0],   // oklch(0.20 0 0) - very dark gray
  [0.30, 0, 0],   // oklch(0.30 0 0) - dark gray
  [0.40, 0, 0],   // oklch(0.40 0 0) - gray
  [0.50, 0, 0],   // oklch(0.50 0 0) - medium gray
  [0.60, 0, 0],   // oklch(0.60 0 0) - gray
  [0.70, 0, 0],   // oklch(0.70 0 0) - light gray
  [0.80, 0, 0],   // oklch(0.80 0 0) - very light gray
  [0.90, 0, 0],   // oklch(0.90 0 0) - near white
  [1.00, 0, 0],   // oklch(1.00 0 0) - white
];

export const HEX_COLORS_GRADIENT: OklchTuple[] = [
  [0.00, 0.00, 0],       // oklch(0.00 0.00 0) - #000000 black
  [0.23, 0.08, 145],     // oklch(0.23 0.08 145) - #084210 dark green
  [0.46, 0.14, 145],     // oklch(0.46 0.14 145) - #108421 green
  [0.70, 0.20, 140],     // oklch(0.70 0.20 140) - #18C631 bright green
  [0.18, 0.11, 285],     // oklch(0.18 0.11 285) - #210842 dark purple
  [0.30, 0.06, 210],     // oklch(0.30 0.06 210) - #294A52 dark blue-gray
  [0.52, 0.10, 170],     // oklch(0.52 0.10 170) - #318C63 blue-green
  [0.75, 0.14, 155],     // oklch(0.75 0.14 155) - #39CE73 light green
  [0.28, 0.18, 280],     // oklch(0.28 0.18 280) - #421084 purple
  [0.40, 0.12, 265],     // oklch(0.40 0.12 265) - #4A5294 blue
  [0.60, 0.10, 220],     // oklch(0.60 0.10 220) - #5294A5 light blue
  [0.82, 0.12, 190],     // oklch(0.82 0.12 190) - #5AD6B5 light cyan
  [0.45, 0.24, 290],     // oklch(0.45 0.24 290) - #6318C6 violet
  [0.52, 0.20, 285],     // oklch(0.52 0.20 285) - #6B5AD6 light purple
  [0.65, 0.14, 250],     // oklch(0.65 0.14 250) - #739CE7 light blue
  [0.85, 0.10, 210],     // oklch(0.85 0.10 210) - #7BDEF7 pale blue
  [0.35, 0.16, 30],      // oklch(0.35 0.16 30) - #842108 red-brown
  [0.48, 0.14, 50],      // oklch(0.48 0.14 50) - #8C6318 brown-orange
  [0.65, 0.14, 100],     // oklch(0.65 0.14 100) - #94A529 olive-yellow
  [0.85, 0.18, 120],     // oklch(0.85 0.18 120) - #9CE739 yellow-green
  [0.45, 0.16, 355],     // oklch(0.45 0.16 355) - #A5294A dark red
  [0.58, 0.10, 35],      // oklch(0.58 0.10 35) - #AD6B5A brownish-red
  [0.72, 0.08, 75],      // oklch(0.72 0.08 75) - #B5AD6B sandy-beige
  [0.92, 0.12, 110],     // oklch(0.92 0.12 110) - #BDEF7B light yellow-green
  [0.58, 0.20, 325],     // oklch(0.58 0.20 325) - #C6318C magenta
  [0.68, 0.14, 345],     // oklch(0.68 0.14 345) - #CE739C pink
  [0.80, 0.06, 25],      // oklch(0.80 0.06 25) - #D6B5AD light pink-beige
  [0.95, 0.08, 100],     // oklch(0.95 0.08 100) - #DEF7BD pale yellow
  [0.70, 0.26, 320],     // oklch(0.70 0.26 320) - #E739CE bright magenta
  [0.82, 0.18, 330],     // oklch(0.82 0.18 330) - #EF7BDE light magenta
  [0.92, 0.12, 325],     // oklch(0.92 0.12 325) - #F7BDEF very light magenta
  [1.00, 0.00, 0],       // oklch(1.00 0.00 0) - #FFFFFF white
];


// Utility Gradients


export const RED_GRADIENT_DARK: OklchTuple[] = [
  [0.40, 0.20, 15],   // oklch(0.40 0.20 15) - dark red
  [0.60, 0.25, 30],   // oklch(0.60 0.25 30) - red-orange
  [0.35, 0.18, 25],   // oklch(0.35 0.18 25) - dark red-brown
  [0.25, 0.15, 20],   // oklch(0.25 0.15 20) - deep red
];

export const RED_GRADIENT_LIGHT: OklchTuple[] = [
  [0.75, 0.15, 10],   // oklch(0.75 0.15 10) - pink
  [0.70, 0.20, 25],   // oklch(0.70 0.20 25) - coral
  [0.75, 0.15, 10],   // oklch(0.75 0.15 10) - pink
  [0.65, 0.22, 20],   // oklch(0.65 0.22 20) - red
];
