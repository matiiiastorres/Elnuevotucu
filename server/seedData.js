const mongoose = require("mongoose")
const Category = require("./models/Category")
const Store = require("./models/Store")
const Product = require("./models/Product")
require("dotenv").config()

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/deliveryapp")

    // Clear existing data
    await Category.deleteMany({})
    await Store.deleteMany({})
    await Product.deleteMany({})

    // Create categories
    const categories = await Category.insertMany([
      {
        name: "Restaurantes",
        description: "Comida deliciosa de restaurantes locales",
        icon: "restaurant",
      },
      {
        name: "Supermercados",
        description: "Todo lo que necesitas para tu hogar",
        icon: "supermarket",
      },
      {
        name: "Farmacias",
        description: "Medicamentos y productos de salud",
        icon: "pharmacy",
      },
      {
        name: "Cafeterías",
        description: "Café y bebidas calientes",
        icon: "coffee",
      },
    ])

    // Create stores
    const stores = await Store.insertMany([
      {
        name: "Pizza Palace",
        description: "Las mejores pizzas de la ciudad",
        rating: 4.5,
        deliveryTime: "30-45 min",
        deliveryFee: 3.5,
        category: categories[0]._id,
      },
      {
        name: "Burger House",
        description: "Hamburguesas gourmet y papas fritas",
        rating: 4.2,
        deliveryTime: "25-40 min",
        deliveryFee: 2.99,
        category: categories[0]._id,
      },
      {
        name: "SuperMart",
        description: "Tu supermercado de confianza",
        rating: 4.0,
        deliveryTime: "45-60 min",
        deliveryFee: 4.99,
        category: categories[1]._id,
      },
      {
        name: "Farmacia Central",
        description: "Medicamentos y productos de salud",
        rating: 4.8,
        deliveryTime: "20-30 min",
        deliveryFee: 2.5,
        category: categories[2]._id,
      },
      {
        name: "Coffee Corner",
        description: "Café artesanal y postres",
        rating: 4.6,
        deliveryTime: "15-25 min",
        deliveryFee: 1.99,
        category: categories[3]._id,
      },
    ])

    // Create products
    await Product.insertMany([
      // Pizza Palace products
      {
        name: "Pizza Margherita",
        description: "Tomate, mozzarella y albahaca fresca",
        price: 12.99,
        category: "Pizzas",
        store: stores[0]._id,
      },
      {
        name: "Pizza Pepperoni",
        description: "Pepperoni y mozzarella",
        price: 14.99,
        category: "Pizzas",
        store: stores[0]._id,
      },
      {
        name: "Coca Cola",
        description: "Refresco 500ml",
        price: 2.5,
        category: "Bebidas",
        store: stores[0]._id,
      },

      // Burger House products
      {
        name: "Hamburguesa Clásica",
        description: "Carne, lechuga, tomate y cebolla",
        price: 8.99,
        category: "Hamburguesas",
        store: stores[1]._id,
      },
      {
        name: "Papas Fritas",
        description: "Papas fritas crujientes",
        price: 3.99,
        category: "Acompañamientos",
        store: stores[1]._id,
      },

      // SuperMart products
      {
        name: "Leche",
        description: "Leche entera 1L",
        price: 1.99,
        category: "Lácteos",
        store: stores[2]._id,
      },
      {
        name: "Pan",
        description: "Pan de molde integral",
        price: 2.49,
        category: "Panadería",
        store: stores[2]._id,
      },

      // Farmacia Central products
      {
        name: "Paracetamol",
        description: "Analgésico 500mg x 20 tabletas",
        price: 4.99,
        category: "Medicamentos",
        store: stores[3]._id,
      },
      {
        name: "Vitamina C",
        description: "Suplemento vitamínico x 30 cápsulas",
        price: 8.99,
        category: "Suplementos",
        store: stores[3]._id,
      },

      // Coffee Corner products
      {
        name: "Café Americano",
        description: "Café negro tradicional",
        price: 3.5,
        category: "Café",
        store: stores[4]._id,
      },
      {
        name: "Croissant",
        description: "Croissant de mantequilla",
        price: 2.99,
        category: "Postres",
        store: stores[4]._id,
      },
    ])

    console.log("Data seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding data:", error)
    process.exit(1)
  }
}

seedData()
