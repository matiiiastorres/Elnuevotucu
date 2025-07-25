"use client"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { useState } from "react"

const Cart = () => {
  const { state, dispatch } = useCart()
  const { state: authState } = useAuth()
  const [showCheckout, setShowCheckout] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const handleCheckout = async () => {
    if (!authState.isAuthenticated) {
      alert("Debes iniciar sesión para realizar un pedido")
      return
    }

    setLoading(true)
    try {
      // Group items by store
      const storeGroups = state.items.reduce((groups, item) => {
        if (!groups[item.storeId]) {
          groups[item.storeId] = {
            storeId: item.storeId,
            storeName: item.storeName,
            items: [],
          }
        }
        groups[item.storeId].items.push({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })
        return groups
      }, {})

      // Create orders for each store
      for (const group of Object.values(storeGroups)) {
        const response = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.token}`,
          },
          body: JSON.stringify({
            storeId: group.storeId,
            items: group.items,
            deliveryAddress: authState.user?.address || {},
            paymentMethod: "card",
            notes: "",
          }),
        })

        if (!response.ok) {
          throw new Error("Error al crear el pedido")
        }
      }

      clearCart()
      alert("¡Pedido realizado con éxito!")
    } catch (error) {
      alert("Error al procesar el pedido: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600">Agrega algunos productos para comenzar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tu Carrito</h1>
        <button onClick={clearCart} className="text-red-600 hover:text-red-800 transition-colors duration-200">
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {state.items.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md p-6 mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg?height=80&width=80"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600 text-sm">{item.storeName}</p>
                  <p className="text-green-600 font-bold">${item.price}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item._id)}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen del pedido</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>$5.00</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${(state.total + 5).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Proceder al pago"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
