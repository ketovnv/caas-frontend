export interface ThemeConfig {
    color: string
    accentColor: string
    backgroundColorsAngles: [[string, string, string, string], number, number, number]
    buttonColorsAngles: [[string, string, string, string], number, number, number]
    boxShadow: string
    buttonTextColors: Array<String>
    buttonActiveTextColors: Array<String>
    navBarButtonBackground: string
    navBarButtonTextColors: Array<String>
    navBarButtonActiveTextColors: Array<String>
}

export const STANDART_DARK: ThemeConfig = {
    color: "oklch(0.991 0.001 0.01) ",
    accentColor: "oklch(0.59 0.222 263.9)",
    boxShadow: "2px 1px rgba(0, 150, 150, 0.05)",
    backgroundColorsAngles: [
        [
            "oklch(0.011 0.111 200.01)",
            "oklch(0.01 0.113 200.05)",
            "oklch(0.01 0.011 0.01 )",
            "oklch(0.01 0.013 264.05 )",
        ],
        -30,
        -15,
        16
    ],
    buttonColorsAngles : [
        [
            "oklch(0.121 0.001 235.01 )",
            "oklch(0.001 0.001 0.01 )",
            "oklch(0.001 0.001 0.01 )",
            "oklch(0.139 0.019 259.66 )",
        ],
        100,
        50,
        8
    ],
    buttonTextColors: [
        "oklch(0.772 0.131 205.58)",
        "oklch(0.613 0.150 263.91)",
        "oklch(0.938 0.095 195.64)",
        "oklch(0.452 0.101 250.05)",
    ],
    buttonActiveTextColors: [
        "oklch(0.968 0.211 109.77)",
        "oklch(0.978 0.124 108.51)",
        "oklch(0.845 0.001 0.01)",
        "oklch(0.991 0.044 107.18)",
    ],
    navBarButtonBackground: "oklch(0.652 0.313 264.05)",
    navBarButtonTextColors: [
        "oklch(0.772 0.231 235.58)",
        "oklch(0.613 0.208 263.91)",
        "oklch(0.938 0.295 195.64)",
        "oklch(0.452 0.235 235.05)",
    ],
    navBarButtonActiveTextColors: [
        "oklch(0.935 0.211 109.77)",
        "oklch(0.978 0.124 108.51)",
        "oklch(0.691 0.171 64.59)",
        "oklch(0.991 0.044 107.18)",
    ],
};

export const STANDART_LIGHT: ThemeConfig = {
    color: "oklch(0.001 0.001 0.01 )",
    accentColor: "oklch(0.421 0.208 263.91 )",
    boxShadow: "2px 1px rgba(0, 0, 0, 0.15)",
    backgroundColorsAngles: [
        [
            "oklch(0.991 0.011 0.01)",
            "oklch(0.881 0.011 235.01)",
            "oklch(0.991 0.011 0.01)",
            "oklch(0.861 0.012 250)",
        ],
        -300,
        -125,
        16
    ],
    buttonColorsAngles: [
        [
            "oklch(0.892 0.0784 89.68)",
            "oklch(0.974 0.0366 107.06)",
            "oklch(0.964 0.119 108.44)",
            "oklch(0.995 0.023 106.82)",
        ],
        0,
        250,
        8
    ],
    buttonTextColors: [
        "oklch(0.2032 0.1408 264.05)",
        "oklch(0.613 0.208 263.90)",
        "oklch(0.471 0.299 264.51)",
        "oklch(0.478 0.201 262.01)",
    ],
    buttonActiveTextColors: [
        "oklch(0.675 0.217 38.80)",
        "oklch(0.594 0.168 45.48)",
        "oklch(0.933 0.197 104.32)",
        "oklch(0.6265 0.135 70.15)",
    ],
    navBarButtonBackground: "oklch(0.252 0.313 264.05)",
    navBarButtonTextColors: [
        "oklch(0.272 0.231 235.58)",
        "oklch(0.413 0.208 263.91)",
        "oklch(0.138 0.295 195.64)",
        "oklch(0.2 0.235 235.05)",
    ],

    navBarButtonActiveTextColors: [
        "oklch(0.555 0.211 109.77)",
        "oklch(0.478 0.124 108.51)",
        "oklch(0.691 0.171 64.59)",
        "oklch(0.591 0.44 107.18)",
    ],
};

export const SPECTRALGRADIENTOKLCH: Array<String> = [
    "oklch(0.63 0.2577 29.23)",
    "oklch(0.68 0.21747 38.8022)",
    "oklch(0.8016 0.1705 73.27)",
    "oklch(0.97 0.211 109.77)",
    "oklch(0.86 0.2107 132.94)",
    "oklch(0.69 0.0247 285.73)",
    "oklch(0.67 0.1801 250.47)",
    "oklch(0.45 0.311267 265.256)",
    "oklch(0.56 0.2956 301.91)",
    "oklch(0.7 0.3225 328.36)",
    "oklch(0.65 0.2684 354.75)",
];

export const SPECTRALGRADIENT = [
    "#ff0000",
    "#ff5500",
    "#ffAA00",
    "#ffff00",
    "#99EE49",
    "#9999AA",
    "#2299FF",
    "#1100ff",
    "#9900ff",
    "#ff00FF",
    "#ff0099",
];


export const RAINBOWGRADIENT = [
    "#FF0000",
    "#FF4000",
    "#FF8000",
    "#FFBF00",
    "#FFFF00",
    "#CCFF00",
    "#80FF00",
    "#40FF00",
    "#00FF00",
    "#00FF40",
    "#00FF80",
    "#00FFBF",
    "#00FFFF",
    "#8000FF",
    "#BF00FF",
    "#FF00FF",
];

export const RAINBOWGRADIENT2 = [
    "#FF0000",
    "#FF5500",
    "#FFAA00",
    "#FFFF00",
    "#AAFF00",
    "#55FF00",
    "#00FF00",
    "#00FF55",
    "#00FFAA",
    "#00FFFF",
    "#00AAFF",
    "#0055FF",
    "#0000FF",
    "#5500FF",
    "#AA00FF",
    "#FF00FF",
];

export const HEXCOLORSGRADIENT = [
    "#000000",
    "#084210",
    "#108421",
    "#18C631",
    "#210842",
    "#294A52",
    "#318C63",
    "#39CE73",
    "#421084",
    "#4A5294",
    "#5294A5",
    "#5AD6B5",
    "#6318C6",
    "#6B5AD6",
    "#739CE7",
    "#7BDEF7",
    "#842108",
    "#8C6318",
    "#94A529",
    "#9CE739",
    "#A5294A",
    "#AD6B5A",
    "#B5AD6B",
    "#BDEF7B",
    "#C6318C",
    "#CE739C",
    "#D6B5AD",
    "#DEF7BD",
    "#E739CE",
    "#EF7BDE",
    "#F7BDEF",
    "#FFFFFF",
];

export const OKLCHGRAY = [
    "oklch( 1% 0 0)",
    "oklch( 10% 0 0)",
    "oklch( 20% 0 0)",
    "oklch( 30% 0 0)",
    "oklch( 40% 0 0)",
    "oklch( 50% 0 0)",
    "oklch( 60% 0 0)",
    "oklch( 70% 0 0)",
    "oklch( 80% 0 0)",
    "oklch( 90% 0 0)",
    "oklch( 100% 0 0)",
];

export const OKLABGRAY = [
    "oklab( 1% 0 0)",
    "oklab( 10% 0 0)",
    "oklab( 20% 0 0)",
    "oklab( 30% 0 0)",
    "oklab( 40% 0 0)",
    "oklab( 50% 0 0)",
    "oklab( 60% 0 0)",
    "oklab( 70% 0 0)",
    "oklab( 80% 0 0)",
    "oklab( 90% 0 0)",
    "oklab( 100% 0 0)",
];

export const redGradientDark = ["#991122", "#FF4400", "#882200", "#551100"];
export const redGradientLight = ["#FF7799", "#FF5555", "#FF7799", "#FF3333"];
