
const IMAGES_BASE_URL = (import.meta.env.VITE_IMAGES_BASE_URL || window.location.origin).replace(/\/+$/, '');

export const SITE_LOGO_URL = `${IMAGES_BASE_URL}/imagenes/Centra_Norte_Logo.png`;

const CONFIGURACION_ESTATICA = {
  NombreSitio: 'Centra Norte',
  Slogan: 'El mall donde grandes cosas pasan',
  LogoUrl: SITE_LOGO_URL,
  Telefono: '2500-9800',
  Direccion: 'Km 8.5 Carretera al Atlántico, 40-26 zona 17, Guatemala',
  HorarioSemana: '9:00 a.m. a 8:00 p.m.',
  HorarioDomingo: '10:00 a.m. a 7:00 p.m.',
  GoogleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Centra+Norte+Guatemala',
  MetaTitulo: 'Centra Norte | Centro comercial y central de transbordo',
  MetaDescripcion: 'Compras, gastronomía, entretenimiento y transporte en un solo destino en zona 17, Guatemala.',
  RedesSociales: [
    { CodigoRedSocial: 1, Nombre: 'Facebook', Url: 'https://www.facebook.com/CentraNorteGT', Icono: 'facebook', Orden: 1 },
    { CodigoRedSocial: 2, Nombre: 'TikTok', Url: 'https://www.tiktok.com/@centranortegt', Icono: 'tiktok', Orden: 2 },
    { CodigoRedSocial: 3, Nombre: 'Instagram', Url: 'https://instagram.com/centranortegt', Icono: 'instagram', Orden: 3 }
  ]
};

export async function obtenerConfiguracion() {
  return CONFIGURACION_ESTATICA;
}
