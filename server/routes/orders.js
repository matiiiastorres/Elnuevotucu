const express = require("express")
const Order = require("../models/Order")
const { auth, storeOwnerAuth } = require("../middleware/auth")
const router = express.Router()

// Create order
router.post("/", auth, async (req, res) => {
  try {
    const { storeId, items, deliveryAddress, paymentMethod, notes } = req.body

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryFee = 5.0 // Fixed delivery fee
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + deliveryFee + tax

    const order = new Order({
      customer: req.user._id,
      store: storeId,
      items,
      subtotal,
      deliveryFee,
      tax,
      total,
      deliveryAddress,
      paymentMethod,
      notes,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
      trackingUpdates: [
        {
          status: "pending",
          message: "Pedido recibido",
        },
      ],
    })

    await order.save()
    await order.populate(["customer", "store", "items.product"])

    res.status(201).json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get user orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("store", "name image")
      .populate("items.product", "name image")
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("store", "name image phone")
      .populate("items.product", "name image")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns this order or is store owner/admin
    if (
      order.customer._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      !req.user.stores.includes(order.store._id)
    ) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update order status (store owners only)
router.put("/:id/status", storeOwnerAuth, async (req, res) => {
  try {
    const { status, message } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if user owns this store
    if (!req.user.stores.includes(order.store) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    order.status = status
    order.trackingUpdates.push({
      status,
      message: message || `Estado actualizado a ${status}`,
    })

    if (status === "delivered") {
      order.actualDeliveryTime = new Date()
    }

    await order.save()
    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get store orders (for store owners)
router.get("/store/:storeId", storeOwnerAuth, async (req, res) => {
  try {
    const { storeId } = req.params

    // Check if user owns this store
    if (!req.user.stores.includes(storeId) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const orders = await Order.find({ store: storeId })
      .populate("customer", "name email phone")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
