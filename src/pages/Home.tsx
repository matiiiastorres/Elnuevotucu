"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Store, Utensils, ShoppingBag, Pill, Coffee } from "lucide-react"

interface StoreCategory {
  _id: string
  name: string
  description: string
  icon: string
  image: string
}

const Home = () => {
  const [categories, setCategories] = useState<StoreCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "restaurant":
        return <Utensils className="h-12 w-12" />
      case "supermarket":
        return <ShoppingBag className="h-12 w-12" />
      case "pharmacy":
        return <Pill className="h-12 w-12" />
      case "coffee":
        return <Coffee className="h-12 w-12" />
      default:
        return <Store className="h-12 w-12" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">¿Qué quieres pedir hoy?</h1>
        <p className="text-gray-600">Elige una categoría para comenzar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/category/${category._id}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
              {getIcon(category.icon)}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{category.name}</h3>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
