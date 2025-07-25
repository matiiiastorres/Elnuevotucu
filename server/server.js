const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/categories", require("./routes/categories"))
app.use("/api/stores", require("./routes/stores"))
app.use("/api/products", require("./routes/products"))
app.use("/api/auth", require("./routes/auth"))
app.use("/api/orders", require("./routes/orders"))
app.use("/api/admin", require("./routes/admin"))

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/deliveryapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
