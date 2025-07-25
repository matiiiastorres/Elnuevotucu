"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Users, Store, ShoppingBag, DollarSign, Plus, Edit, Trash2 } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalStores: number
  totalOrders: number
  totalRevenue: number
}

interface Category {
  _id: string
  name: string
  description: string
  icon: string
}

const AdminDashboard = () => {
  const { state } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "restaurant",
  })

  useEffect(() => {
    if (state.user?.role === "admin") {
      fetchDashboardData()
      fetchCategories()
    }
  }, [state.user])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      })
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory
        ? `http://localhost:5000/api/admin/categories/${editingCategory._id}`
        : "http://localhost:5000/api/admin/categories"

      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(categoryForm),
      })

      if (response.ok) {
        fetchCategories()
        setShowCategoryForm(false)
        setEditingCategory(null)
        setCategoryForm({ name: "", description: "", icon: "restaurant" })
      }
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
    })
    setShowCategoryForm(true)
  }

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta categoría?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/categories/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        })

        if (response.ok) {
          fetchCategories()
        }
      } catch (error) {
        console.error("Error deleting category:", error)
      }
    }
  }

  if (state.user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Administración</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tiendas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStores}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Gestionar Categorías</h2>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Categoría</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category._id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800">{category.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{category.description}</p>
              <div className="flex space-x-2">
                <button onClick={() => handleEditCategory(category)} className="text-blue-600 hover:text-blue-800">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => handleDeleteCategory(category._id)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </h2>
              <button
                onClick={() => {
                  setShowCategoryForm(false)
                  setEditingCategory(null)
                  setCategoryForm({ name: "", description: "", icon: "restaurant" })
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                <select
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="restaurant">Restaurante</option>
                  <option value="supermarket">Supermercado</option>
                  <option value="pharmacy">Farmacia</option>
                  <option value="coffee">Cafetería</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                {editingCategory ? "Actualizar" : "Crear"} Categoría
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
