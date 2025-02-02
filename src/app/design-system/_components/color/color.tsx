import { cn } from '@/utils/cn';
import { Heading } from '@/components/heading';
import { FC } from 'react';
import { calcContrast } from '@/utils/color/calc_contrast';

type Color =
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
type Stage = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

const COLOR_VARIANTS = {
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

const getColorCode = (code: `${Color}.${Stage}` | 'white') => {
  if (code === 'white') return COLOR_VARIANTS.white;
  const [color, stage] = code.split('.') as [Color, Stage];
  return COLOR_VARIANTS[color][stage];
};

const ColorInfo: FC<{
  name: string;
  code: `${Color}.${Stage}` | 'white';
  codeDark: `${Color}.${Stage}` | 'white';
  variant: 'background' | 'border' | 'foreground';
}> = ({ name, code, codeDark, variant }) => {
  const colorCode = getColorCode(code);
  const colorCodeDark = getColorCode(codeDark);

  return (
    <div className="flex w-36 flex-col items-center gap-2">
      <p>{name}</p>
      <div className="flex items-center gap-3">
        <div className="light flex flex-col items-center gap-1">
          <div
            className="border-border-primary flex size-12 items-center justify-center rounded-full border"
            style={
              variant === 'foreground'
                ? {
                    // backgroundColor:
                    //   COLOR_VARIANTS[contrastColor][contrastStage],
                    color: colorCode,
                  }
                : variant === 'background'
                  ? {
                      backgroundColor: colorCode,
                      // color:
                      //   COLOR_VARIANTS[contrastColor][contrastStage],
                    }
                  : {
                      borderColor: colorCode,
                    }
            }
          >
            light
          </div>
          <p className="text-xs">{code}</p>
        </div>
        <div className="dark flex flex-col items-center gap-1">
          <div
            className="border-border-primary flex size-12 items-center justify-center rounded-full border"
            style={
              variant === 'foreground'
                ? {
                    // backgroundColor:
                    //   COLOR_VARIANTS[contrastColorDark][
                    //     contrastStageDark
                    //   ],
                    color: colorCodeDark,
                  }
                : variant === 'background'
                  ? {
                      backgroundColor: colorCodeDark,
                      // color:
                      //   COLOR_VARIANTS[contrastColorDark][
                      //     contrastStageDark
                      //   ],
                    }
                  : {
                      borderColor: colorCodeDark,
                    }
            }
          >
            dark
          </div>
          <p className="text-xs">{codeDark}</p>
        </div>
      </div>
    </div>
  );
};

export const Color: FC = () => {
  return (
    <section className="text-fg-base flex flex-col gap-4">
      <Heading type="h2">Color Token</Heading>
      <div className="bg-bg-base flex flex-col justify-between gap-3 rounded-xl p-3">
        <Heading type="h3">Neutral Color</Heading>
        <p className="text-text-description text-sm">
          グレースケールを元にした色、理由がない限りこの色を利用する
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col justify-between gap-3 rounded-xl p-3">
            <Heading type="h4">Foreground Color</Heading>
            <div className="flex flex-wrap gap-3">
              <ColorInfo
                name="base"
                code="gray.900"
                codeDark="gray.50"
                variant="foreground"
              />
              <ColorInfo
                name="subtle"
                code="gray.400"
                codeDark="gray.500"
                variant="foreground"
              />
              <ColorInfo
                name="mute"
                code="gray.700"
                codeDark="gray.300"
                variant="foreground"
              />
              <ColorInfo
                name="inverse"
                code="gray.50"
                codeDark="gray.900"
                variant="foreground"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 rounded-xl p-3">
            <Heading type="h4">Background Color</Heading>
            <div className="flex flex-wrap gap-3">
              <ColorInfo
                name="base"
                code="white"
                codeDark="gray.900"
                variant="background"
              />
              <ColorInfo
                name="subtle"
                code="gray.100"
                codeDark="gray.800"
                variant="background"
              />
              <ColorInfo
                name="mute"
                code="gray.200"
                codeDark="gray.700"
                variant="background"
              />
              <ColorInfo
                name="emphasize"
                code="gray.300"
                codeDark="gray.600"
                variant="background"
              />
              <ColorInfo
                name="inverse"
                code="gray.900"
                codeDark="white"
                variant="background"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 rounded-xl p-3">
            <Heading type="h4">Border Color</Heading>
            <div className="flex flex-wrap gap-3">
              <ColorInfo
                name="base"
                code="gray.300"
                codeDark="gray.700"
                variant="border"
              />
              <ColorInfo
                name="subtle"
                code="gray.100"
                codeDark="gray.900"
                variant="border"
              />
              <ColorInfo
                name="mute"
                code="gray.200"
                codeDark="gray.800"
                variant="border"
              />
              <ColorInfo
                name="emphasize"
                code="gray.400"
                codeDark="gray.500"
                variant="border"
              />
              <ColorInfo
                name="inverse"
                code="gray.700"
                codeDark="gray.300"
                variant="border"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-bg-base flex flex-col justify-between gap-1 rounded-xl p-3">
        <Heading type="h3">Primitive Color</Heading>
        <p className="text-text-description text-sm">
          情緒的な役割を持つ色、強調やアクセントに利用する
        </p>
        <div className="flex flex-col gap-2">
          <Heading type="h4">Primary</Heading>
          <div className="flex flex-wrap gap-3">
            <ColorInfo
              name="fg"
              code="teal.700"
              codeDark="teal.300"
              variant="foreground"
            />
            <ColorInfo
              name="bg"
              code="teal.600"
              codeDark="teal.600"
              variant="background"
            />
            <ColorInfo
              name="bg subtle"
              code="teal.100"
              codeDark="teal.900"
              variant="background"
            />
            <ColorInfo
              name="bg mute"
              code="teal.200"
              codeDark="teal.800"
              variant="background"
            />
            <ColorInfo
              name="bg emphasize"
              code="teal.300"
              codeDark="teal.700"
              variant="background"
            />
            <ColorInfo
              name="border"
              code="teal.600"
              codeDark="teal.600"
              variant="border"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Heading type="h4">Secondary</Heading>
          <div className="flex flex-wrap gap-2">
            <ColorInfo
              name="fg"
              code="cyan.700"
              codeDark="cyan.300"
              variant="foreground"
            />
            <ColorInfo
              name="bg"
              code="cyan.600"
              codeDark="cyan.600"
              variant="background"
            />
            <ColorInfo
              name="bg subtle"
              code="cyan.100"
              codeDark="cyan.900"
              variant="background"
            />
            <ColorInfo
              name="bg mute"
              code="cyan.200"
              codeDark="cyan.800"
              variant="background"
            />
            <ColorInfo
              name="bg emphasize"
              code="cyan.300"
              codeDark="cyan.700"
              variant="background"
            />
            <ColorInfo
              name="border"
              code="cyan.600"
              codeDark="cyan.600"
              variant="border"
            />
          </div>
        </div>
      </div>
      <div className="bg-bg-base flex flex-col justify-between gap-3 rounded-xl p-3">
        <Heading type="h3">Semantic Color</Heading>
        <p className="text-text-description text-sm">
          機能的な役割を持つ色(情報、成功、警告、エラー)、利用者に色を用いて情報を届けたいときに利用する
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col justify-between gap-3 rounded-xl p-3">
            <Heading type="h4">Foreground Color</Heading>
            <div className="flex flex-wrap gap-3">
              <ColorInfo
                name="info"
                code="blue.600"
                codeDark="blue.300"
                variant="foreground"
              />
              <ColorInfo
                name="success"
                code="green.600"
                codeDark="green.300"
                variant="foreground"
              />
              <ColorInfo
                name="warning"
                code="yellow.600"
                codeDark="yellow.300"
                variant="foreground"
              />
              <ColorInfo
                name="error"
                code="red.600"
                codeDark="red.300"
                variant="foreground"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 rounded-xl p-3">
            <Heading type="h4">Background Color</Heading>
            <div className="flex flex-wrap gap-3">
              <ColorInfo
                name="info"
                code="blue.100"
                codeDark="blue.900"
                variant="background"
              />
              <ColorInfo
                name="success"
                code="green.100"
                codeDark="green.900"
                variant="background"
              />
              <ColorInfo
                name="warning"
                code="yellow.100"
                codeDark="yellow.900"
                variant="background"
              />
              <ColorInfo
                name="error"
                code="red.100"
                codeDark="red.900"
                variant="background"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 rounded-xl p-3">
            <Heading type="h4">Border Color</Heading>
            <div className="flex flex-wrap gap-3">
              <ColorInfo
                name="info"
                code="blue.500"
                codeDark="blue.400"
                variant="border"
              />
              <ColorInfo
                name="success"
                code="green.500"
                codeDark="green.400"
                variant="border"
              />
              <ColorInfo
                name="warning"
                code="yellow.500"
                codeDark="yellow.400"
                variant="border"
              />
              <ColorInfo
                name="error"
                code="red.500"
                codeDark="red.400"
                variant="border"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-bg-base flex flex-col justify-between gap-1 rounded-xl p-3">
        <Heading type="h3">Base Color</Heading>
        <p className="text-text-description text-sm">
          デザインシステム全体で利用する基本色
        </p>
        <div className="flex flex-col gap-3">
          {Object.entries(COLOR_VARIANTS).map((value) => {
            return (
              <div
                key={value[0]}
                className="flex flex-col justify-between gap-3 rounded-xl p-3"
              >
                <Heading type="h4">{value[0]}</Heading>
                {typeof value[1] === 'string' ? (
                  <div className="dark flex flex-col items-center gap-1">
                    <div
                      className="border-border-primary flex h-12 w-24 items-center justify-center rounded-4xl border"
                      style={{
                        backgroundColor: value[1],
                      }}
                    />
                    <p className="text-xs">{value[0]}</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-between gap-2">
                    {Object.entries(value[1]).map((color) => {
                      return (
                        <div
                          key={color[0]}
                          className="flex flex-col items-center gap-2"
                        >
                          <div
                            className={cn(
                              'border-border-primary flex h-12 w-24 items-center justify-center rounded-4xl border',
                              calcContrast(
                                color[1],
                                COLOR_VARIANTS.white,
                              ) < 4.5
                                ? 'text-fg-base'
                                : 'text-text-on-fill',
                            )}
                            style={{
                              backgroundColor: color[1],
                            }}
                          >
                            {color[0]}
                          </div>
                          <p className="text-xs">{color[1]}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
