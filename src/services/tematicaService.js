import { apiGet } from './apiClient';

function themeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'institucional';
}

export async function obtenerTematicaActiva() {
  const theme = await apiGet('/tema-inicio');
  if (!theme) return null;

  return {
    CodigoTemaMensual: theme.codigo,
    NombreTema: theme.nombre,
    ClaveTema: themeKey(theme.nombre),
    TituloHero: theme.mensajePrincipal,
    DescripcionHero: theme.mensajeSecundario,
    ImagenHeroDesktopUrl: theme.imagenUrl,
    ImagenHeroMobileUrl: theme.imagenUrl,
    MostrarTematica: theme.MostrarTematica ? 1 : 0
  };
}
