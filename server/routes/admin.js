const express = require("express")
const Category = require("../models/Category")
const Store = require("../models/Store")
const Product = require("../models/Product")
const User = require("../models/User")
const Order = require("../models/Order")
const { adminAuth, storeOwnerAuth } = require("../middleware/auth")
const router = express.Router()

// Dashboard stats
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalStores = await Store.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ])

    const recentOrders = await Order.find()
      .populate("customer", "name email")
      .populate("store", "name")
      .sort({ createdAt: -1 })
      .limit(10)

    res.json({
      stats: {
        totalUsers,
        totalStores,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentOrders,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Manage categories
router.post("/categories", adminAuth, async (req, res) => {
  try {
    const category = new Category(req.body)
    await category.save()
    res.status(201).json(category)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.put("/categories/:id", adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }
    res.json(category)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.delete("/categories/:id", adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }
    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Manage stores (admin can manage all, store owners only their own)
router.post("/stores", storeOwnerAuth, async (req, res) => {
  try {
    const storeData = { ...req.body }

    // If not admin, assign store to current user
    if (req.user.role !== "admin") {
      storeData.owner = req.user._id
    }

    const store = new Store(storeData)
    await store.save()

    // Add store to user's stores array
    if (req.user.role === "store_owner") {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { stores: store._id },
      })
    }

    res.status(201).json(store)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get("/stores", storeOwnerAuth, async (req, res) => {
  try {
    let query = {}

    // If not admin, only show user's stores
    if (req.user.role !== "admin") {
      query = { _id: { $in: req.user.stores } }
    }

    const stores = await Store.find(query).populate("category", "name")
    res.json(stores)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put("/stores/:id", storeOwnerAuth, async (req, res) => {
  try {
    const query = { _id: req.params.id }

    // If not admin, ensure user owns this store
    if (req.user.role !== "admin") {
      query._id = { $in: req.user.stores }
    }

    const store = await Store.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    })

    if (!store) {
      return res.status(404).json({ message: "Store not found or access denied" })
    }

    res.json(store)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Manage products
router.post("/products", storeOwnerAuth, async (req, res) => {
  try {
    const { storeId } = req.body

    // Check if user owns this store (unless admin)
    if (req.user.role !== "admin" && !req.user.stores.includes(storeId)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.get("/products/store/:storeId", storeOwnerAuth, async (req, res) => {
  try {
    const { storeId } = req.params

    // Check if user owns this store (unless admin)
    if (req.user.role !== "admin" && !req.user.stores.includes(storeId)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const products = await Product.find({ store: storeId })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put("/products/:id", storeOwnerAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Check if user owns the store this product belongs to
    if (req.user.role !== "admin" && !req.user.stores.includes(product.store)) {
      return res.status(403).json({ message: "Access denied" })
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.json(updatedProduct)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.delete("/products/:id", storeOwnerAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Check if user owns the store this product belongs to
    if (req.user.role !== "admin" && !req.user.stores.includes(product.store)) {
      return res.status(403).json({ message: "Access denied" })
    }

    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
