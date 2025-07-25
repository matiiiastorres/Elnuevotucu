const express = require("express")
const router = express.Router()
const Category = require("../models/Category")

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find()
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new category
router.post("/", async (req, res) => {
  try {
    const category = new Category(req.body)
    const savedCategory = await category.save()
    res.status(201).json(savedCategory)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router
