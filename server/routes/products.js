const express = require("express")
const router = express.Router()
const Product = require("../models/Product")

// Get products by store, grouped by category
router.get("/store/:storeId", async (req, res) => {
  try {
    const products = await Product.find({
      store: req.params.storeId,
      isAvailable: true,
    })

    // Group products by category
    const groupedProducts = products.reduce((acc, product) => {
      const category = product.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(product)
      return acc
    }, {})

    // Convert to array format
    const result = Object.keys(groupedProducts).map((category) => ({
      name: category,
      products: groupedProducts[category],
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new product
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body)
    const savedProduct = await product.save()
    res.status(201).json(savedProduct)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router
