import Icon from './Icon.jsx'

function FilterBar({
  search,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  sort,
  onSortChange,
}) {
  const sorts = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Popular' },
    { value: 'rating', label: 'Rating' },
    { value: 'price_asc', label: 'Price low' },
    { value: 'price_desc', label: 'Price high' },
  ]

  return (
    <div className="filter-shell">
      <div className="search-shell filter-search-shell">
        <Icon name="search" className="h-5 w-5 text-ink-500" />
        <input
          className="search-input"
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search courses by title"
        />
      </div>

      <div className="filter-row">
        <div className="filter-pills">
          {categories.map((category) => {
            const active = category === selectedCategory
            return (
              <button
                key={category}
                className={active ? 'pill-brand' : 'pill-neutral'}
                type="button"
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </button>
            )
          })}
        </div>

        <div className="sort-chip-row">
          {sorts.map((item) => (
            <button
              key={item.value}
              className={sort === item.value ? 'btn-secondary' : 'btn-ghost'}
              type="button"
              onClick={() => onSortChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FilterBar
