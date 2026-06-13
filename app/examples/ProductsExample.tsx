import { useProducts, useFeaturedProducts, Product } from '../hooks/useApi';
import { getProductImageUrl } from '../utils/image';

export default function ProductsExample() {
  const { data: products, isLoading, error } = useProducts();
  const { data: featured } = useFeaturedProducts(8);

  if (isLoading) {
    return <div className="p-4">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading products: {error.message}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {featured?.map((product: Product) => (
          <div key={product.id} className="border rounded p-4 hover:shadow-lg">
            <img
              src={getProductImageUrl(product.image)}
              alt={product.name}
              className="w-full h-48 object-cover rounded mb-2"
            />
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-gray-600">{product.brand}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg font-semibold">${product.price}</span>
              <div className="text-sm">
                ⭐ {product.rating} ({product.reviews} reviews)
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-4">All Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products?.map((product: Product) => (
          <div key={product.id} className="border rounded p-4 hover:shadow-lg">
            <img
              src={getProductImageUrl(product.image)}
              alt={product.name}
              className="w-full h-48 object-cover rounded mb-2"
            />
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-gray-600">{product.brand}</p>
            <p className="text-sm text-gray-500 mt-1">{product.description}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg font-semibold">${product.price}</span>
              {product.isSale && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Sale
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

