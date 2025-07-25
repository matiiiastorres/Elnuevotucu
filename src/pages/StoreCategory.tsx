'use client';

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';

interface Store {
  _id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  category: string;
}

const StoreCategory = () => {
  const { categoryId } = useParams();
  const [stores, setStores] = useState<Store[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, [categoryId]);

  const fetchStores = async () => {
    try {
      const response = await fetch(
        `https://back-del-nuevo-tucu.onrender.com/api/stores/category/${categoryId}`
      );
      const data = await response.json();
      setStores(data.stores);
      setCategoryName(data.categoryName);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {categoryName}
        </h1>
        <p className="text-gray-600">{stores.length} tiendas disponibles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <Link
            key={store._id}
            to={`/store/${store._id}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <img
                src={store.image || '/placeholder.svg?height=200&width=300'}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {store.name}
              </h3>
              <p className="text-gray-600 mb-3 text-sm">{store.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
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
                  <span>${store.deliveryFee}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StoreCategory;
