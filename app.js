const express = require("express");
const mongoose = require("mongoose");

const app = express();

// middleware used for collect data from request body
app.use(express.json());
// form data
app.use(express.urlencoded({ extended: true }));

// create product schema
// simple mongoose built-in schema validation
// custom validation
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: [3, "minimum length of product title should be 3"],
    maxlength: [100, "maximum length of product title should be 100"],
    trim: true, // trim-> unecessary space cut & promote original string
    required: [true, "product title is required"],
    enum: {
      values: ["iPhone", "Samsung", "Redmi"],
      message: "{VALUE} is not supported",
    },

    // custom validation
    // validate: {
    //   validator: function (v) {
    //     return v.length === 10;
    //   },
    //   message: (props) => `${props.value} is not a valid title`,
    // },
  },

  price: {
    type: Number,
    min: [25, "minimum price of product should be 25"],
    max: [500, "maximum price of products should be 500"],
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },

  // email:{

  //   type: String,
  //   unique: true,

  // },

  // username:{

  //   type: String,
  //   unique: true,

  // },

  description: {
    type: String,
    required: true,
  },

  // custom validation
  phone: {
    type: String,
    required: [true, "phone number is required"],
    validate: {
      validator: function (v) {
        const regexPhone = /\d{2}-\d{10}/;
        return regexPhone.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// create product model
const productModel = mongoose.model("Products", productSchema);

// database connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/testProductDB");
    console.log("db is connected");
  } catch (error) {
    console.log("db is disconnected");
    console.log(error.message);
    process.exit(1);
  }
};
connectDB();

// Route
app.get("/", (req, res) => {
  res.send("welcome to Homepage");
});

// CRUD - CREATE->READ->UPDATE->DELETE

// create
app.post("/products", async (req, res) => {
  try {
    // get data from request body
    const title = req.body.title;
    const price = req.body.price;
    const rating = req.body.rating;
    const description = req.body.description;
    const phone = req.body.phone;

    // mongodb database store
    const newProduct = new productModel({
      title: title,
      price: price,
      rating: rating,
      description: description,
      phone: phone,
    });

    // // multiple documents
    // const productData = await productModel.insertMany([
    //   {
    //     title: "iphone 6",
    //     price: 100,
    //     description: "this is great phone",
    //   },

    //   {
    //     title: "iphone 5",
    //     price: 70,
    //     description: "this is perfect phone",
    //   },

    //   {
    //     title: "iphone 4",
    //     price: 50,
    //     description: "this is fantastic phone",
    //   },
    // ]);

    const productData = await newProduct.save();
    res.status(200).send(productData);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

//Read
// GET: /products -> Return all the products
app.get("/products", async (req, res) => {
  try {
    const price = req.query.price; // dynamic find data
    const rating = req.query.rating; // dynamic find data

    let products;

    if (price && rating) {
      products = await productModel.find({
        $and: [{ price: { $gt: price } }, { rating: { $gt: rating } }],
      });
      // .sort({ price: 1 })
      // .select({ title: 1, _id: 0 });
    } else {
      products = await productModel.find();
      // .sort({ price: 1 })
      // .select({ title: 1, _id: 0 });
    }

    if (products) {
      res.status(200).send({
        success: true,
        message: "Return all products",
        data: products,
      });
    } else {
      res.status(404).send({ message: "Products not found", success: false });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Read single document
// GET: /products/:id -> return a specific product
app.get("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findOne({ _id: id });

    // res.send(product);

    if (product) {
      res.status(200).send({
        success: true,
        message: "Return single product",
        data: product,
      });
    } else {
      res.status(404).send({ message: "Products not found", success: false });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Delete
//DELETE: /products/:id -> delete a product based on id
app.delete("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findByIdAndDelete({ _id: id });

    if (product) {
      res.status(200).send({
        success: true,
        message: "deleted single product",
        data: product,
      });
    } else {
      res.status(404).send({
        message: "product was not deleted with this id",
        success: false,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Update
// PUT: /products/:id -> update a product based on id
app.put("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const title = req.body.title;
    const price = req.body.price;
    const rating = req.body.rating;
    const description = req.body.description;
    const phone = req.body.phone;

    const updatedProduct = await productModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          title: title,
          price: price,
          rating: rating,
          description: description,
          phone: phone,
        },
      },

      { new: true } // updated response object
    );

    if (updatedProduct) {
      res.status(200).send({
        success: true,
        message: "updated single product",
        data: updatedProduct,
      });
    } else {
      res.status(404).send({
        message: "product was not update with this id",
        success: false,
      });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Database -> collections -> document

// POST: /products ->  create a product

// GET: /products -> Return all the products
// GET: /products/:id -> return a specific product

// PUT: /products/:id -> update a product based on id
// DELETE: /products/:id -> delete a product based on id

module.exports = app;
