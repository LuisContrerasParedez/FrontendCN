import LocalCard from './LocalCard';

export default function LocalGrid({ locales = [], feature = false, headingLevel = 2, className = '' }) {
  if (!locales.length) {
    return <div className="empty-state">No hay locales disponibles en este momento.</div>;
  }

  return (
    <div className={`mosaic mosaic--count-${Math.min(locales.length, 4)}${feature ? ' mosaic--feature' : ''}${locales.length === 1 ? ' mosaic--single' : ''}${className ? ` ${className}` : ''}`}>
      {locales.map((local) => (
        <LocalCard key={local.CodigoLocal} local={local} headingLevel={headingLevel} />
      ))}
    </div>
  );
}
