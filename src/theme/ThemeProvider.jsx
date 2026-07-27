import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { obtenerTematicaActiva } from '../services/tematicaService';

const ThemeContext = createContext(null);
const COLOR_FIELDS = {
  ColorPrimario: '--theme-primary',
  ColorSecundario: '--theme-secondary',
  ColorAcento: '--theme-accent'
};

const FOREGROUND_FIELDS = {
  ColorPrimario: '--on-primary',
  ColorSecundario: '--on-secondary',
  ColorAcento: '--on-accent'
};

function validThemeKey(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || '')) ? value : 'institucional';
}

function validHex(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : null;
}

function relativeLuminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map((value) => parseInt(value, 16) / 255);
  const linear = channels.map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(first, second) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function bestForeground(background) {
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, '#000000') ? '#ffffff' : '#000000';
}

export function ThemeProvider({ refreshToken, children }) {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const applied = useRef([]);

  useEffect(() => {
    let cancelled = false;
    obtenerTematicaActiva()
      .then((value) => {
        if (!cancelled) {
          setTheme(value && Object.keys(value).length ? value : null);
          setError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTheme(null);
          setError('La temática mensual no pudo actualizarse.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [refreshToken]);

  useEffect(() => {
    const root = document.documentElement;
    applied.current.forEach((property) => root.style.removeProperty(property));
    applied.current = [];

    if (theme) {
      Object.entries(COLOR_FIELDS).forEach(([field, property]) => {
        const color = validHex(theme[field]);
        if (color) {
          root.style.setProperty(property, color);
          applied.current.push(property);

          const foregroundProperty = FOREGROUND_FIELDS[field];
          if (foregroundProperty) {
            root.style.setProperty(foregroundProperty, bestForeground(color));
            applied.current.push(foregroundProperty);
          }
        }
      });

      const requestedText = validHex(theme.ColorTexto);
      const safeText = requestedText && contrastRatio('#ffffff', requestedText) >= 4.5
        ? requestedText
        : '#111a35';

      if (requestedText) {
        root.style.setProperty('--theme-text', safeText);
        applied.current.push('--theme-text');
      }
    }

    const key = validThemeKey(theme?.ClaveTema);
    root.dataset.theme = key;
    document.body.dataset.theme = key;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = validHex(theme?.ColorPrimario) || '#0d2b6b';

    return () => {
      applied.current.forEach((property) => root.style.removeProperty(property));
      delete root.dataset.theme;
      delete document.body.dataset.theme;
    };
  }, [theme]);

  const value = useMemo(() => ({ theme, loading, error }), [theme, loading, error]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe utilizarse dentro de ThemeProvider.');
  return context;
}
