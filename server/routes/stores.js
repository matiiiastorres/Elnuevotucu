const express = require("express")
const router = express.Router()
const Store = require("../models/Store")
const Category = require("../models/Category")

// Get stores by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const stores = await Store.find({
      category: req.params.categoryId,
      isActive: true,
    }).populate("category")

    const category = await Category.findById(req.params.categoryId)

    res.json({
      stores,
      categoryName: category ? category.name : "Categoría",
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single store
router.get("/:id", async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate("category")
    if (!store) {
      return res.status(404).json({ message: "Store not found" })
    }
    res.json(store)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new store
router.post("/", async (req, res) => {
  try {
    const store = new Store(req.body)
    const savedStore = await store.save()
    res.status(201).json(savedStore)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router
