import { useId, useState } from 'react';
import Escudo from './Escudo';
import { ONDA_CRESTA, ONDA_BLANCA, ONDA_ORO, ONDA_MEDIA, ONDA_FONDO } from './escena/escenografia';

/** Contorno del paño: los bordes superior e inferior comparten fase, así que la
 *  altura del lienzo se mantiene constante y la tela no se deforma. */
const PANO =
  'M8 26C52 8 96 34 140 22C172 13 196 20 214 14L214 92C196 98 172 91 140 100C96 112 52 86 8 104Z';

export default function ListonBandera({ escudoSrc }) {
  const reactId = useId();
  const uid = `lis${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [falloEscudo, setFalloEscudo] = useState(false);

  return (
    <div className="sepListon" aria-hidden="true">
      <svg className="sepListon__ondas" viewBox="0 0 1600 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`${uid}-cresta`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8ccdf0" />
            <stop offset="1" stopColor="#4ea3dd" />
          </linearGradient>
          <linearGradient id={`${uid}-blanca`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#eef5fa" />
          </linearGradient>
          <linearGradient id={`${uid}-oro`} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#f6d97f" />
            <stop offset="0.5" stopColor="#dcae37" />
            <stop offset="1" stopColor="#b98d1e" />
          </linearGradient>
          <linearGradient id={`${uid}-media`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4aa0d6" />
            <stop offset="1" stopColor="#1f76b3" />
          </linearGradient>
          <linearGradient id={`${uid}-fondo`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#175a91" />
            <stop offset="1" stopColor="#0a3660" />
          </linearGradient>
        </defs>

        {/* Filo blanco de la cresta: una copia 4 px más arriba */}
        <g transform="translate(0 -4)">
          <path className="sepListon__capa sepListon__capa--cresta" d={ONDA_CRESTA} fill="#ffffff" opacity="0.75" />
        </g>
        <path className="sepListon__capa sepListon__capa--cresta" d={ONDA_CRESTA} fill={`url(#${uid}-cresta)`} />
        <path className="sepListon__capa sepListon__capa--blanca" d={ONDA_BLANCA} fill={`url(#${uid}-blanca)`} />
        <path d={ONDA_ORO} fill={`url(#${uid}-oro)`} />
        <path className="sepListon__capa sepListon__capa--media" d={ONDA_MEDIA} fill={`url(#${uid}-media)`} />
        <path d={ONDA_FONDO} fill={`url(#${uid}-fondo)`} />
      </svg>

      <div className="sepListon__bandera">
        <svg viewBox="0 0 222 118" role="presentation" focusable="false">
          <defs>
            <clipPath id={`${uid}-pano`}>
              <path d={PANO} />
            </clipPath>
            <linearGradient id={`${uid}-azul`} x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0" stopColor="#6cb8e6" />
              <stop offset="1" stopColor="#2e86c6" />
            </linearGradient>
            <linearGradient id={`${uid}-pliegues`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0b3d68" stopOpacity="0.22" />
              <stop offset="0.14" stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="0.3" stopColor="#0b3d68" stopOpacity="0.2" />
              <stop offset="0.47" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="0.63" stopColor="#0b3d68" stopOpacity="0.16" />
              <stop offset="0.8" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="1" stopColor="#0b3d68" stopOpacity="0.24" />
            </linearGradient>
            <linearGradient id={`${uid}-brillo`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.42" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${uid}-cinta`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f3d478" />
              <stop offset="1" stopColor="#bf9124" />
            </linearGradient>
          </defs>

          {/* Colas doradas: anclan la bandera al listón en vez de dejarla flotando */}
          <g fill={`url(#${uid}-cinta)`}>
            <path d="M14 40C0 44 -10 54 -14 66C-4 62 4 60 14 60C10 54 10 46 14 40Z" />
            <path d="M208 34C222 38 232 48 236 60C226 56 218 54 208 54C212 48 212 40 208 34Z" />
          </g>

          <g clipPath={`url(#${uid}-pano)`}>
            <rect x="0" y="0" width="77" height="118" fill={`url(#${uid}-azul)`} />
            <rect x="77" y="0" width="68" height="118" fill="#ffffff" />
            <rect x="145" y="0" width="77" height="118" fill={`url(#${uid}-azul)`} />
            <rect x="0" y="0" width="222" height="118" fill={`url(#${uid}-pliegues)`} />
            <rect className="sepListon__brillo" x="-120" y="0" width="120" height="118" fill={`url(#${uid}-brillo)`} />
          </g>

          <path d={PANO} fill="none" stroke="#ffffff" strokeWidth="1.6" opacity="0.55" />

          <g transform="translate(88 41) scale(0.46)">
            {escudoSrc && !falloEscudo ? (
              <image
                href={escudoSrc}
                width="100"
                height="100"
                preserveAspectRatio="xMidYMid meet"
                onError={() => setFalloEscudo(true)}
              />
            ) : (
              <Escudo />
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
