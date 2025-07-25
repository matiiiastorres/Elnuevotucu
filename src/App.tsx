import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { CartProvider } from "./context/CartContext"
import { AuthProvider } from "./context/AuthContext"
import Header from "./components/Header"
import Home from "./pages/Home"
import StoreCategory from "./pages/StoreCategory"
import Store from "./pages/Store"
import Cart from "./pages/Cart"
import AdminDashboard from "./pages/AdminDashboard"
import Orders from "./pages/Orders"
import Profile from "./pages/Profile"
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard"
import "./App.css"

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:categoryId" element={<StoreCategory />} />
              <Route path="/store/:storeId" element={<Store />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/store-dashboard" element={<StoreOwnerDashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
