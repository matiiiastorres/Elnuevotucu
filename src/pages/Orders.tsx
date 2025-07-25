"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { Clock, MapPin, Package } from "lucide-react"

interface Order {
  _id: string
  orderNumber: string
  store: {
    name: string
    image: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  status: string
  createdAt: string
  estimatedDeliveryTime: string
  trackingUpdates: Array<{
    status: string
    message: string
    timestamp: string
  }>
}

const Orders = () => {
  const { state } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (state.isAuthenticated) {
      fetchOrders()
    }
  }, [state.isAuthenticated])

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      })
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-orange-100 text-orange-800"
      case "ready":
        return "bg-purple-100 text-purple-800"
      case "delivering":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "confirmed":
        return "Confirmado"
      case "preparing":
        return "Preparando"
      case "ready":
        return "Listo"
      case "delivering":
        return "En camino"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  if (!state.isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Inicia sesión para ver tus pedidos</h1>
        </div>
      </div>
    )
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No tienes pedidos aún</h2>
          <p className="text-gray-500">¡Haz tu primer pedido y aparecerá aquí!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Pedido #{order.orderNumber}</h3>
                    <p className="text-gray-600">{order.store.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Pedido: {new Date(order.createdAt).toLocaleDateString("es-ES")}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      Estimado: {new Date(order.estimatedDeliveryTime).toLocaleTimeString("es-ES")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Productos:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.trackingUpdates.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Seguimiento:</h4>
                    <div className="space-y-2">
                      {order.trackingUpdates.slice(-3).map((update, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{update.message}</span>
                          <span className="text-gray-500">
                            {new Date(update.timestamp).toLocaleTimeString("es-ES")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders
