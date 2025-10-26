import React from 'react';

const ProductFilters = ({
  filters,
  setFilters,
  availableFilters,
  handleFilterChange
}) => {

  const handlePriceChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      price: { ...prev.price, [type]: value }
    }));
  };

  const handleCheckboxChange = (filterType, value) => {
    const newValues = filters[filterType].includes(value)
      ? filters[filterType].filter(v => v !== value)
      : [...filters[filterType], value];
    handleFilterChange(filterType, newValues);
  };

  return (
    <div className="filters-sidebar">
      <div className="filter-section">
        <h3>Faixa de Preço</h3>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min: R$1,100"
            value={filters.price.min}
            onChange={(e) => handlePriceChange('min', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max: R$2,200"
            value={filters.price.max}
            onChange={(e) => handlePriceChange('max', e.target.value)}
          />
        </div>
      </div>

      {Object.entries(availableFilters).map(([filterType, options]) => (
        <div key={filterType} className="filter-section">
          <h3>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</h3>
          <div className="filter-options">
            {options.map(option => (
              <label key={option} className="filter-option">
                <input
                  type="checkbox"
                  checked={filters[filterType].includes(option)}
                  onChange={() => handleCheckboxChange(filterType, option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductFilters;
