const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use((error, req, res, next) => {
  console.log(error);
  const statusCode = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(statusCode).json({
    message: message,
    data: data
  });
});

//mongodb+srv://dashzou:<password>@db-shop-sf22n.mongodb.net/test?retryWrites=true&w=majority
//mongodb://localhost:27018/PostManger
mongoose
  .connect("mongodb://localhost:27018/PostManger", {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(_ => console.log("Connect to mongodb done."))
  .catch(err => console.log(err));

app.use("/feed", feedRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/auth", authRoutes);

app.listen(8080);
