'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Store {
  _id: string;
  name: string;
  description: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  category: {
    _id: string;
    name: string;
  };
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

interface Category {
  _id: string;
  name: string;
}

const StoreOwnerDashboard = () => {
  const { state } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [storeForm, setStoreForm] = useState({
    name: '',
    description: '',
    deliveryTime: '',
    deliveryFee: 0,
    category: '',
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    isAvailable: true,
  });

  useEffect(() => {
    if (state.user?.role === 'store_owner' || state.user?.role === 'admin') {
      fetchStores();
      fetchCategories();
    }
  }, [state.user]);

  useEffect(() => {
    if (selectedStore) {
      fetchProducts(selectedStore);
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    try {
      const response = await fetch(
        'https://back-del-nuevo-tucu.onrender.com/api/admin/stores',
        {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      const data = await response.json();
      setStores(data);
      if (data.length > 0 && !selectedStore) {
        setSelectedStore(data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchProducts = async (storeId: string) => {
    try {
      const response = await fetch(
        `https://back-del-nuevo-tucu.onrender.com/api/admin/products/store/${storeId}`,
        {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        'https://back-del-nuevo-tucu.onrender.com/api/categories'
      );
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingStore
        ? `https://back-del-nuevo-tucu.onrender.com/api/admin/stores/${editingStore._id}`
        : 'https://back-del-nuevo-tucu.onrender.com/api/admin/stores';

      const method = editingStore ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(storeForm),
      });

      if (response.ok) {
        fetchStores();
        setShowStoreForm(false);
        setEditingStore(null);
        setStoreForm({
          name: '',
          description: '',
          deliveryTime: '',
          deliveryFee: 0,
          category: '',
        });
      }
    } catch (error) {
      console.error('Error saving store:', error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        ...productForm,
        store: selectedStore,
      };

      const url = editingProduct
        ? `https://back-del-nuevo-tucu.onrender.com/api/admin/products/${editingProduct._id}`
        : 'https://back-del-nuevo-tucu.onrender.com/api/admin/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        fetchProducts(selectedStore);
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({
          name: '',
          description: '',
          price: 0,
          category: '',
          isAvailable: true,
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setStoreForm({
      name: store.name,
      description: store.description,
      deliveryTime: store.deliveryTime,
      deliveryFee: store.deliveryFee,
      category: store.category._id,
    });
    setShowStoreForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      isAvailable: product.isAvailable,
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (
      window.confirm('¿Estás seguro de que quieres eliminar este producto?')
    ) {
      try {
        const response = await fetch(
          `https://back-del-nuevo-tucu.onrender.com/api/admin/products/${id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${state.token}`,
            },
          }
        );

        if (response.ok) {
          fetchProducts(selectedStore);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (state.user?.role !== 'store_owner' && state.user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Tienda</h1>

      {/* Store Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Mis Tiendas</h2>
          <button
            onClick={() => setShowStoreForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Tienda</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => (
            <div
              key={store._id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedStore === store._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedStore(store._id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{store.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditStore(store);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              <p className="text-gray-600 text-sm mb-2">{store.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>⭐ {store.rating}</span>
                <span>🕒 {store.deliveryTime}</span>
                <span>💰 ${store.deliveryFee}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Management */}
      {selectedStore && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Productos</h2>
            <button
              onClick={() => setShowProductForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {product.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">
                    ${product.price}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      product.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.isAvailable ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Categoría: {product.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Store Form Modal */}
      {showStoreForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingStore ? 'Editar Tienda' : 'Nueva Tienda'}
              </h2>
              <button
                onClick={() => {
                  setShowStoreForm(false);
                  setEditingStore(null);
                  setStoreForm({
                    name: '',
                    description: '',
                    deliveryTime: '',
                    deliveryFee: 0,
                    category: '',
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStoreSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={storeForm.name}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={storeForm.description}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={storeForm.category}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiempo de entrega
                </label>
                <input
                  type="text"
                  placeholder="ej: 30-45 min"
                  value={storeForm.deliveryTime}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, deliveryTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo de envío
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={storeForm.deliveryFee}
                  onChange={(e) =>
                    setStoreForm({
                      ...storeForm,
                      deliveryFee: Number.parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                {editingStore ? 'Actualizar' : 'Crear'} Tienda
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    description: '',
                    price: 0,
                    category: '',
                    isAvailable: true,
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      price: Number.parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <input
                  type="text"
                  placeholder="ej: Pizzas, Hamburguesas, Bebidas"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={productForm.isAvailable}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      isAvailable: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isAvailable"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Producto disponible
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                {editingProduct ? 'Actualizar' : 'Crear'} Producto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;
