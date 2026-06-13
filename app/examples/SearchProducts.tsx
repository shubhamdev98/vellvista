'use client';

import { useState } from 'react';
import { useSearchProducts, useCategories } from '../hooks/useApi';
import { getProductImageUrl } from '../utils/image';

export function SearchProducts() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const { data: results, isLoading, error } = useSearchProducts(
    query,
    category,
    minPrice,
    maxPrice
  );
  const { data: categories } = useCategories();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Search Products</h2>

      <div className="mb-6">
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or brand..."
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <label className="block text-sm font-light mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-light mb-2">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-light mb-2">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="999"
              className="w-full px-4 py-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading && <div>Searching...</div>}
      {error && <div className="text-red-600">Error: {error.message}</div>}

      {results && results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {results.map((product) => (
            <div key={product.id} className="border rounded p-4">
              <img
                src={getProductImageUrl(product.image)}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.brand}</p>
              <p className="font-semibold">${product.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">
          {query || category ? 'No products found' : 'Enter search terms'}
        </div>
      )}
    </div>
  );
}
