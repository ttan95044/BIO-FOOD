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
  } else {
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
app.post("/updateproduct", async (req, res) => {
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
        id: id,
      });
    }

    console.log("Updated product:", product.name);
    res.json({
      success: true,
      message: "Product updated successfully",
      product: product,
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
});

// creating API for deleting products
app.post("/removeproduct", async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.body.id });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        id: req.body.id,
      });
    }
    console.log("Removed product:", product.name);
    res.json({
      success: true,
      message: "Product removed successfully",
      name: product.name,
    });
  } catch (error) {
    console.error("Error removing product:", error.message);
    res.status(500).json({
      success: false,
      message: "Error removing product",
      error: error.message,
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

// Shema creating for user model
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Creating endpoint for registering users
app.post("/signup", async (req, res) => {
  // Thêm dấu / ở đầu route
  const check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({
      success: false,
      message: "existing user found with same email address",
    });
  }
  const cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, "secret_ecom");
  res.json({
    success: true,
    token,
  });
});

// Creating endpoint for login users
app.post("/login", async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secret_ecom");
      res.json({
        success: true,
        token,
      });
    } else {
      res.json({ success: false, error: "Wrong Password" });
    }
  } else {
    res.json({ success: false, error: "Wrong email id" });
  }
});

// creating endpoint for newcollection data
app.get("/newcollection", async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("Newcollection fetched");
  res.send(newcollection);
});

//creating endpoint for popular in women section
app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({ category: "women" });
  let popular_in_women = products.slice(0, 4);
  console.log("Popular in women fetched");
  res.send(popular_in_women);
});

// creating middelware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ error: "Please provide a valid auth token" });
  }

  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).send({ error: "Invalid auth token" });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).send({ error: "Expired auth token" });
    }
    res.status(500).send({ error: "Internal Server Error" });
  }
};


// creating endpoint for adding product in cartdata
app.post("/addtocart", fetchUser, async (req, res) => {
  console.log("Added", req.body.itemId);
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    if (!userData) {
      return res.status(404).send("User not found");
    }

    // Tăng số lượng sản phẩm trong giỏ hàng
    userData.cartData[req.body.itemId] = (userData.cartData[req.body.itemId] || 0) + 1;

    // Cập nhật dữ liệu giỏ hàng trong cơ sở dữ liệu
    await Users.findByIdAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData }
    );

    res.send("Added to cart");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// creating endpoint for removing product from cartdata
app.post('/removefromcart', fetchUser, async (req, res) => {
  console.log("Removed", req.body.itemId);
  try {
    let userData = await Users.findOne({ _id: req.user.id });
    if (!userData) {
      return res.status(404).send("User not found");
    }

    // Kiểm tra nếu số lượng sản phẩm trong giỏ hàng lớn hơn 0 thì mới giảm đi
    if (userData.cartData[req.body.itemId] > 0) {
      // Trừ số lượng sản phẩm trong giỏ hàng
      userData.cartData[req.body.itemId] -= 1;

      // Cập nhật dữ liệu giỏ hàng trong cơ sở dữ liệu
      await Users.findByIdAndUpdate(
        { _id: req.user.id },
        { cartData: userData.cartData }
      );

      res.send("Removed to cart");
    } else {
      res.status(400).send("No item to remove from cart");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//create endpoint to get cart data
app.post('/getcart', fetchUser, async (req, res) => {
  console.log("getcart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
})

app.listen(port, (error) => {
  if (!error) {
    console.log("Server is running on port " + port);
  } else {
    console.log("Error: " + error);
  }
});
