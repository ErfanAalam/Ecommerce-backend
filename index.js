import express from "express";
import cors from "cors";
import mongoose, { model, Schema } from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("Connected succesfully");
  app.listen(port, () => {
    console.log("Server Started at port Number : " + port);
  });
});

const productSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  file: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
});

const productModel = model("product", productSchema);

app.post("/addProduct", async (req, res) => {
  let { id, file, title, desc, price } = req.body;

  const productToSave = new productModel({
    id,
    file,
    title,
    desc,
    price,
  });

  await productToSave.save();

  res.json("Product Added");
});

app.get("/getProducts", async (req, res) => {
  const products = await productModel.find();
  res.json(products);
});

app.get("/getProducts/:id", async (req, res) => {
  const id = req.params.id;

  const product = await productModel.findOne({ id });
  res.json(product);
});

// Cart schema

const CartScmeha = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  items: [
    {
      id: String,
      file: String,
      title: String,
      desc: String,
      price: String,
    },
  ],
});

const cartModel = model("cart", CartScmeha);

app.get("/getCart", async (req, res) => {
  const cart = await cartModel.find();

  res.json(cart);
});

app.post("/addToCart", async (req, res) => {
  let { userId, product } = req.body;

  const cart = await cartModel.findOne({ userId });

  if (cart) {
    cart.items.push(product);
    await cart.save();
  } else {
    const newCart = new cartModel({
      userId,
      items: product,
    });

    await newCart.save();
  }

  res.json("Product added to cart succesfully");
});

app.delete("/removeFromCart", async (req, res) => {
  const { userId, prodId } = req.body;

  const cart = await cartModel.findOne({ userId });

  const index = cart.items.findIndex((item) => item.id === prodId);

  cart.items.splice(index, 1);

  await cart.save();

  res.json("Product removed from cart");
});

app.delete("/removeCart", async (req, res) => {
  const { userId } = req.body;

  await cartModel.findOneAndDelete({ userId });

  res.json("Product removes from cart");
  console.log("removed from  cart");
});
