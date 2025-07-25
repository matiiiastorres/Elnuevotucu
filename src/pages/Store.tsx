'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock, MapPin, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface Store {
  _id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
}

interface ProductCategory {
  name: string;
  products: Product[];
}

const Store = () => {
  const { storeId } = useParams();
  const { dispatch } = useCart();
  const [store, setStore] = useState<Store | null>(null);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreData();
  }, [storeId]);

  const fetchStoreData = async () => {
    try {
      const [storeResponse, productsResponse] = await Promise.all([
        fetch(`https://back-del-nuevo-tucu.onrender.com/api/stores/${storeId}`),
        fetch(
          `https://back-del-nuevo-tucu.onrender.com/api/products/store/${storeId}`
        ),
      ]);

      const storeData = await storeResponse.json();
      const productsData = await productsResponse.json();

      setStore(storeData);
      setProductCategories(productsData);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    if (store) {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          _id: product._id,
          name: product.name,
          price: product.price,
          storeId: store._id,
          storeName: store.name,
          image: product.image,
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!store) {
    return <div className="text-center py-8">Tienda no encontrada</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Store Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="h-64 bg-gray-200">
          <img
            src={store.image || '/placeholder.svg?height=300&width=800'}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {store.name}
          </h1>
          <p className="text-gray-600 mb-4">{store.description}</p>

          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{store.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{store.deliveryTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Envío: ${store.deliveryFee}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products by Category */}
      {productCategories.map((category) => (
        <div key={category.name} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {category.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200">
                  <img
                    src={
                      product.image || '/placeholder.svg?height=200&width=300'
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-green-600">
                      ${product.price}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Store;
