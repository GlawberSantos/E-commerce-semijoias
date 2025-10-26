import React from 'react';

const ProductFilters = ({
  filters,
  setFilters,
  availableFilters
}) => {
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      price: {
        ...prev.price,
        [name]: value
      }
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  return (
    <div className="product-filters">
      <div className="filter-section">
        <h3>Preço</h3>
        <div className="price-inputs">
          <div className="input-group">
            <label htmlFor="min">De:</label>
            <input
              type="number"
              id="min"
              name="min"
              value={filters.price.min}
              onChange={handlePriceChange}
              min="0"
              placeholder="R$ Min"
            />
          </div>
          <div className="input-group">
            <label htmlFor="max">Até:</label>
            <input
              type="number"
              id="max"
              name="max"
              value={filters.price.max}
              onChange={handlePriceChange}
              min="0"
              placeholder="R$ Max"
            />
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h3>Material</h3>
        <div className="checkbox-group">
          {availableFilters.materiais.map(material => (
            <label key={material} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.materiais.includes(material)}
                onChange={() => handleFilterChange('materiais', material)}
              />
              {material}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Cor</h3>
        <div className="color-options">
          {availableFilters.cores.map(color => (
            <button
              key={color}
              className={`color-button ${filters.cores.includes(color) ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleFilterChange('cores', color)}
              aria-label={`Filtrar por cor ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Estilo</h3>
        <div className="checkbox-group">
          {availableFilters.Estilos.map(style => (
            <label key={style} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.Estilos.includes(style)}
                onChange={() => handleFilterChange('Estilos', style)}
              />
              {style}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Ocasião</h3>
        <div className="checkbox-group">
          {availableFilters.ocasião.map(occasion => (
            <label key={occasion} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.ocasião.includes(occasion)}
                onChange={() => handleFilterChange('ocasião', occasion)}
              />
              {occasion}
            </label>
          ))}
        </div>
      </div>

      <button
        className="clear-filters"
        onClick={() => setFilters({
          price: { min: '', max: '' },
          materiais: [],
          cores: [],
          Estilos: [],
          ocasião: []
        })}
      >
        Limpar filtros
      </button>
    </div>
  );
};

export default ProductFilters;