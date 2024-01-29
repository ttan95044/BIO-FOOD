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

//database Connection with MongooDB
mongoose.connect(
  "mongodb+srv://ttan95044:Tranduytan240701@cluster0.uomineg.mongodb.net/BIO-FOOD"
);

app.get("/", (rep, res) => {
  res.send("Express app is running");
});

//image storage engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (rep, file, cb) => {
    return cb(
      null,
      `${file.filename}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

// creating upload endpoint endpoint for images
app.post("/upload",upload.single('product'),(res,res)=>{
    
})

app.listen(port, (error) => {
  if (!error) {
    console.log("Server is running on port" + port);
  } else {
    console.log("Error: " + error);
  }
});
