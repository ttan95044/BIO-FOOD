const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Database Connection with MongoDB
mongoose.connect(
  "mongodb+srv://ttan95044:Tranduytan240701@cluster0.uomineg.mongodb.net/BIO-FOOD"
);

app.get("/", (req, res) => {
  res.send("Express app is running");
});

// Image storage engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

// Creating upload endpoint for images
app.use("/images", express.static("upload/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// schema for creating product
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  available: {
    type: Boolean,
    required: true,
  },
});

app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } 
  else {
    id = 1;
  }
  try {
    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      date: new Date(), // Thêm ngày hiện tại
      available: true,
    });

    console.log(product); // Kiểm tra xem dữ liệu sản phẩm được tạo ra đúng không

    await product.save(); // Lưu sản phẩm vào cơ sở dữ liệu
    console.log("Saved");

    res.json({
      success: true,
      message: "Product added successfully",
      product: product, // Trả về thông tin sản phẩm đã được lưu
    });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({
      success: false,
      message: "Error adding product",
      error: error.message,
    });
  }
});

// Creating API for updating products
app.post('/updateproduct', async (req, res) => {
  try {
    const { id, name, image, category, new_price, old_price } = req.body;

    const product = await Product.findOneAndUpdate(
      { id: id },
      { name, image, category, new_price, old_price },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        id: id
      });
    }

    console.log("Updated product:", product.name);
    res.json({
      success: true,
      message: "Product updated successfully",
      product: product
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message
    });
  }
});


// creating API for deleting products
app.post('/removeproduct', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.body.id });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        id: req.body.id
      });
    }
    console.log("Removed product:", product.name);
    res.json({
      success: true,
      message: "Product removed successfully",
      name: product.name
    });
  } catch (error) {
    console.error("Error removing product:", error.message);
    res.status(500).json({
      success: false,
      message: "Error removing product",
      error: error.message
    });
  }
});

// creating API for getting all products
app.get("/allproducts", async (req, res) => {
  try {
    const products = await Product.find({});
    console.log("ALl products fetched:");
    res.send(products);
  } catch (error) {
    console.error("Error getting products:", error.message);
    res.status(500).json({
      success: false,
      message: "Error getting products",
      error: error.message,
    });
  }
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server is running on port " + port);
  } else {
    console.log("Error: " + error);
  }
});
