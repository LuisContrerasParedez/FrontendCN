export default function CategoryFilter({ categories, value, onChange }) {
  if (categories.length < 2) return null;
  return (
    <>
      <label className="category-select">
        <span>Categoría</span>
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>{category.name}</option>
          ))}
        </select>
      </label>
      <fieldset className="category-filter">
        <legend className="visually-hidden">Filtrar por categoría</legend>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            className={value === category.slug ? 'is-active' : ''}
            aria-pressed={value === category.slug}
            onClick={() => onChange(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </fieldset>
    </>
  );
}
