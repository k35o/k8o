export type Color =
  | 'gray'
  | 'red'
  | 'pink'
  | 'purple'
  | 'cyan'
  | 'blue'
  | 'teal'
  | 'green'
  | 'yellow'
  | 'orange';
export type Stage =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

export const COLOR_VARIANTS = {
  white: '#ffffff',
  gray: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#991919',
    800: '#511111',
    900: '#300c0c',
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#a41752',
    800: '#6d0e34',
    900: '#45061f',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#641ba3',
    800: '#4a1772',
    900: '#2f0553',
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0c5c72',
    800: '#134152',
    900: '#072a38',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#a3cfff',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#173da6',
    800: '#1a3478',
    900: '#14204a',
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0c5d56',
    800: '#114240',
    900: '#032726',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#116932',
    800: '#124a28',
    900: '#042713',
  },
  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#845209',
    800: '#713f12',
    900: '#422006',
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#92310a',
    800: '#6c2710',
    900: '#3b1106',
  },
} as const satisfies Record<Color, Record<Stage, string>> & {
  white: string;
};

export const SEMANTIC_COLOR_VARIANTS = {
  base: {
    fg: {
      base: {
        light: 'gray.900',
        dark: 'gray.50',
      },
      subtle: {
        light: 'gray.400',
        dark: 'gray.500',
      },
      mute: {
        light: 'gray.700',
        dark: 'gray.300',
      },
      inverse: {
        light: 'gray.50',
        dark: 'gray.900',
      },
    },
    bg: {
      base: {
        light: 'white',
        dark: 'gray.900',
      },
      subtle: {
        light: 'gray.100',
        dark: 'gray.800',
      },
      mute: {
        light: 'gray.200',
        dark: 'gray.700',
      },
      emphasize: {
        light: 'gray.300',
        dark: 'gray.600',
      },
      inverse: {
        light: 'gray.900',
        dark: 'white',
      },
    },
    border: {
      base: {
        light: 'gray.400',
        dark: 'gray.600',
      },
      subtle: {
        light: 'gray.100',
        dark: 'gray.900',
      },
      mute: {
        light: 'gray.200',
        dark: 'gray.800',
      },
      emphasize: {
        light: 'gray.500',
        dark: 'gray.500',
      },
      inverse: {
        light: 'gray.700',
        dark: 'gray.300',
      },
    },
  },
  primitive: {
    primary: {
      fg: {
        light: 'teal.700',
        dark: 'teal.300',
      },
      bg: {
        light: 'teal.300',
        dark: 'teal.700',
      },
      bgSubtle: {
        light: 'teal.100',
        dark: 'teal.900',
      },
      bgMute: {
        light: 'teal.200',
        dark: 'teal.800',
      },
      bgEmphasize: {
        light: 'teal.300',
        dark: 'teal.700',
      },
      border: {
        light: 'teal.600',
        dark: 'teal.600',
      },
    },
    secondary: {
      fg: {
        light: 'cyan.700',
        dark: 'cyan.300',
      },
      bg: {
        light: 'cyan.300',
        dark: 'cyan.700',
      },
      bgSubtle: {
        light: 'cyan.100',
        dark: 'cyan.900',
      },
      bgMute: {
        light: 'cyan.200',
        dark: 'cyan.800',
      },
      bgEmphasize: {
        light: 'cyan.300',
        dark: 'cyan.700',
      },
      border: {
        light: 'cyan.600',
        dark: 'cyan.600',
      },
    },
  },
  semantic: {
    fg: {
      info: {
        light: 'blue.700',
        dark: 'blue.300',
      },
      success: {
        light: 'green.700',
        dark: 'green.300',
      },
      warning: {
        light: 'yellow.700',
        dark: 'yellow.300',
      },
      error: {
        light: 'red.700',
        dark: 'red.300',
      },
    },
    bg: {
      info: {
        light: 'blue.100',
        dark: 'blue.900',
      },
      success: {
        light: 'green.100',
        dark: 'green.900',
      },
      warning: {
        light: 'yellow.100',
        dark: 'yellow.900',
      },
      error: {
        light: 'red.100',
        dark: 'red.900',
      },
    },
    border: {
      info: {
        light: 'blue.500',
        dark: 'blue.400',
      },
      success: {
        light: 'green.500',
        dark: 'green.400',
      },
      warning: {
        light: 'yellow.500',
        dark: 'yellow.400',
      },
      error: {
        light: 'red.500',
        dark: 'red.400',
      },
    },
  },
} as const;

export const getColorCode = (code: `${Color}.${Stage}` | 'white') => {
  if (code === 'white') return COLOR_VARIANTS.white;
  const [color, stage] = code.split('.') as [Color, Stage];
  return COLOR_VARIANTS[color][stage];
};
