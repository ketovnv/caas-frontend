import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  TexturedBackground,
  AsphaltBackground,
  ConcreteBackground,
  MetalBackground,
  GraniteBackground,
  SandBackground,
  // FabricBackground,
  PureNoiseBackground,
  type TextureType,
  type ColorScheme,
} from 'shared/ui/animated/background';
import {
  STANDART_DARK,
  STANDART_LIGHT,
  oklchToString,
  type OklchTuple,
  type GradientConfig,
  type ThemeConfig,
} from 'shared/config';
import { themeStore } from '@/shared';

// ============================================================================
// Theme Color Viewer
// ============================================================================

interface ColorSwatchProps {
  name: string;
  color: OklchTuple;
}

function ColorSwatch({ name, color }: ColorSwatchProps) {
  const cssColor = oklchToString(color);
  const tupleStr = `[${color[0].toFixed(3)}, ${color[1].toFixed(3)}, ${color[2].toFixed(1)}]`;

  // Determine if we need light or dark text based on lightness
  const textColor = color[0] > 0.6 ? 'text-black' : 'text-white';

  return (
    <div
      className="p-4 rounded-xl flex flex-col gap-1"
      style={{ backgroundColor: cssColor }}
    >
      <span className={`font-bold text-lg ${textColor}`}>{name}</span>
      <span className={`font-mono text-sm ${textColor} opacity-80`}>{tupleStr}</span>
    </div>
  );
}

function isOklchTuple(value: unknown): value is OklchTuple {
  return Array.isArray(value) &&
    value.length === 3 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number' &&
    typeof value[2] === 'number';
}

function isGradientConfig(value: unknown): value is GradientConfig {
  return Array.isArray(value) &&
    value.length === 4 &&
    Array.isArray(value[0]) &&
    typeof value[1] === 'number';
}

function isOklchArray(value: unknown): value is OklchTuple[] {
  return Array.isArray(value) &&
    value.length > 0 &&
    Array.isArray(value[0]) &&
    value[0].length === 3 &&
    typeof value[0][0] === 'number';
}

export const ThemeColorViewer = observer(function ThemeColorViewer() {
  const theme: ThemeConfig = themeStore.isDark ? STANDART_DARK : STANDART_LIGHT;
  const themeName = themeStore.isDark ? 'STANDART_DARK' : 'STANDART_LIGHT';

  const entries: { name: string; color: OklchTuple }[] = [];

  for (const [key, value] of Object.entries(theme)) {
    if (key === 'boxShadow') continue; // Skip non-color fields

    if (isOklchTuple(value)) {
      // Single color
      entries.push({ name: key, color: value });
    } else if (isGradientConfig(value)) {
      // Gradient - extract colors array
      const [colors] = value;
      colors.forEach((c, i) => {
        entries.push({ name: `${key}[${i}]`, color: c });
      });
    } else if (isOklchArray(value)) {
      // Array of colors
      value.forEach((c, i) => {
        entries.push({ name: `${key}[${i}]`, color: c });
      });
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-white">
        Theme Colors: <span className="text-purple-400">{themeName}</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
        {entries.map(({ name, color }) => (
          <ColorSwatch key={name} name={name} color={color} />
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// Demo: All Textures Gallery
// ============================================================================

const TEXTURE_DEMOS: { texture: TextureType; scheme: ColorScheme; label: string }[] = [
  { texture: 'asphalt', scheme: 'dark', label: 'Асфальт' },
  { texture: 'asphalt', scheme: 'charcoal', label: 'Асфальт (Charcoal)' },
  { texture: 'concrete', scheme: 'midnight', label: 'Бетон' },
  { texture: 'concrete', scheme: 'light', label: 'Бетон (Light)' },
  { texture: 'metal', scheme: 'steel', label: 'Металл' },
  { texture: 'metal', scheme: 'ocean', label: 'Металл (Ocean)' },
  { texture: 'granite', scheme: 'obsidian', label: 'Гранит' },
  { texture: 'granite', scheme: 'wine', label: 'Гранит (Wine)' },
  { texture: 'sand', scheme: 'bronze', label: 'Песок' },
  { texture: 'sand', scheme: 'copper', label: 'Песок (Copper)' },
  { texture: 'fabric', scheme: 'forest', label: 'Ткань' },
  { texture: 'fabric', scheme: 'pearl', label: 'Ткань (Pearl)' },
];

export function TextureGallery() {
  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      <ThemeColorViewer />
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-8">
        {TEXTURE_DEMOS.map(({ texture, scheme, label }) => (
            <TexturedBackground
                key={`${texture}-${scheme}`}
                texture={texture}
                scheme={scheme}
                className="aspect-video rounded-xl shadow-lg"
                vignette
                vignetteIntensity={0.3}
            >
              <div className="flex items-center justify-center h-full">
            <span className="text-white font-medium text-sm drop-shadow-lg">
              {label}
            </span>
              </div>
            </TexturedBackground>
        ))}

        {/* Pure CSS variant */}
        <PureNoiseBackground scheme="dark" intensity="strong" className="aspect-video rounded-xl shadow-lg">
          <div className="flex items-center justify-center h-full">
            <span className="text-white font-medium text-sm drop-shadow-lg">
              Pure CSS (fastest)
            </span>
          </div>
        </PureNoiseBackground>
        <UsageExamples />
      </div>
    </div>
  );
}

// ============================================================================
// Usage Examples
// ============================================================================

export function UsageExamples() {
  return (
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-8">
        {/* Basic usage */}
        <AsphaltBackground className="p-8 rounded-2xl">
          <h2 className="text-white text-2xl font-bold">Default Asphalt</h2>
          <p className="text-gray-300 mt-2">Простейший вариант использования</p>
        </AsphaltBackground>

        {/* With custom scheme */}
        <ConcreteBackground scheme="ocean" className="p-8 rounded-2xl" innerShadow>
          <h2 className="text-white text-2xl font-bold">Concrete + Ocean</h2>
          <p className="text-cyan-200 mt-2">С внутренней тенью для глубины</p>
        </ConcreteBackground>

        {/* Metal with high vignette */}
        <MetalBackground
            className="p-8 rounded-2xl"
            vignetteIntensity={0.5}
        >
          <h2 className="text-white text-2xl font-bold">Brushed Metal</h2>
          <p className="text-slate-300 mt-2">Усиленный эффект виньетки</p>
        </MetalBackground>

        {/* Custom gradient override */}
        <TexturedBackground
            texture="granite"
            gradient="bg-gradient-to-r from-purple-900 via-violet-900 to-purple-900"
            className="p-8 rounded-2xl"
        >
          <h2 className="text-white text-2xl font-bold">Custom Gradient</h2>
          <p className="text-purple-200 mt-2">Кастомный градиент поверх гранита</p>
        </TexturedBackground>

        {/* Light theme */}
        <SandBackground scheme="cloud" className="p-8 rounded-2xl">
          <h2 className="text-gray-900 text-2xl font-bold">Light Sand</h2>
          <p className="text-gray-600 mt-2">Светлая тема для карточек</p>
        </SandBackground>

        {/* Full page hero */}
        <GraniteBackground
            scheme="wine"
            className="min-h-[50vh] flex items-center justify-center rounded-2xl"
            vignette
            vignetteIntensity={0.4}
            innerShadow
        >
          <div className="text-center">
            <h1 className="text-white text-5xl font-black tracking-tight">
              Hero Section
            </h1>
            <p className="text-rose-200 mt-4 text-lg">
              Идеально для лендингов и hero-блоков
            </p>
          </div>
        </GraniteBackground>

        {/* Ultra-performance mode */}
        <PureNoiseBackground
            scheme="forest"
            intensity="medium"
            className="p-8 rounded-2xl"
        >
          <h2 className="text-white text-2xl font-bold">Pure CSS Mode</h2>
          <p className="text-emerald-200 mt-2">
            Без SVG — максимальная производительность, ~0ms paint
          </p>
        </PureNoiseBackground>
      </div>
  );
}

// ============================================================================
// Interactive Playground (for Storybook/dev)
// ============================================================================

export function TexturePlayground() {
  const [texture, setTexture] = useState<TextureType>('asphalt');
  const [scheme, setScheme] = useState<ColorScheme>('dark');
  const [vignette, setVignette] = useState(true);
  const [vignetteIntensity, setVignetteIntensity] = useState(0.25);
  const [innerShadow, setInnerShadow] = useState(false);

  const textures: TextureType[] = ['asphalt', 'concrete', 'metal', 'granite', 'sand', 'fabric'];
  const schemes: ColorScheme[] = [
    'dark', 'charcoal', 'midnight', 'obsidian',
    'light', 'cloud', 'pearl',
    'steel', 'copper', 'bronze', 'ocean', 'forest', 'wine',
  ];

  return (
      <div className="p-8 bg-gray-100 min-h-screen">
        {/* Controls */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-sm space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Texture</span>
              <select
                  value={texture}
                  onChange={(e) => setTexture(e.target.value as TextureType)}
                  className="px-3 py-2 border rounded-lg"
              >
                {textures.map((t) => (
                    <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Scheme</span>
              <select
                  value={scheme}
                  onChange={(e) => setScheme(e.target.value as ColorScheme)}
                  className="px-3 py-2 border rounded-lg"
              >
                {schemes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">
              Vignette: {vignetteIntensity.toFixed(2)}
            </span>
              <input
                  type="range"
                  min="0"
                  max="0.6"
                  step="0.05"
                  value={vignetteIntensity}
                  onChange={(e) => setVignetteIntensity(parseFloat(e.target.value))}
                  className="w-32"
              />
            </label>

            <label className="flex items-center gap-2 self-end pb-2">
              <input
                  type="checkbox"
                  checked={vignette}
                  onChange={(e) => setVignette(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Vignette</span>
            </label>

            <label className="flex items-center gap-2 self-end pb-2">
              <input
                  type="checkbox"
                  checked={innerShadow}
                  onChange={(e) => setInnerShadow(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Inner Shadow</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <TexturedBackground
            texture={texture}
            scheme={scheme}
            vignette={vignette}
            vignetteIntensity={vignetteIntensity}
            innerShadow={innerShadow}
            className="min-h-[60vh] rounded-2xl shadow-xl flex items-center justify-center"
        >
          <div className="text-center p-8">
            <h1 className="text-white text-4xl font-bold drop-shadow-lg">
              {texture.charAt(0).toUpperCase() + texture.slice(1)}
            </h1>
            <p className="text-white/70 mt-2 text-lg">
              {scheme} • vignette: {vignetteIntensity.toFixed(2)}
            </p>
          </div>
        </TexturedBackground>
      </div>
  );
}
