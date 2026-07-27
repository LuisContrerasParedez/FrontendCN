export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;
  return (
    <nav className="pagination" aria-label="Paginación">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)}>Anterior</button>
      <span>Página {page} de {pageCount}</span>
      <button type="button" disabled={page === pageCount} onClick={() => onChange(page + 1)}>Siguiente</button>
    </nav>
  );
}
