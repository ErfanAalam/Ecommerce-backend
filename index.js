import express from 'express'
import cors from 'cors'
import mongoose, { model, Schema } from 'mongoose'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

// import path from 'path'
// import multer from 'multer'
// import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const port = 3000

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
app.use(bodyParser.json());
app.use(cors({ origin: "*" }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("Connected succesfully");
        app.listen(port, () => {
            console.log("Server Started at port Number : " + port);
        })
    })



// Nodemailer environment
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
     user: process.env.MAIL_USER,
     pass: process.env.MAIL_PASS,
    },
   });



const productSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    file: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    quantity:{
        type: String,
        required: true
    },
    category : {
        type: String,
        required: true
    }
})



const productModel = model("product", productSchema)


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join('uploads/'));
//     },
//     filename: (req, file, cb) => {   
//         cb(null,`${file.fieldname}-${Date.now()}-${file.originalname}`);
//     },
// });


// const upload = multer({ storage });


// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.post("/addProduct", async (req, res) => {
    let { id, file, title, desc, price,quantity,category } = req.body
    // let file = req.file.path
    // console.log(id,file);

    const productToSave = new productModel({
        id,
        file,
        title,
        desc,
        price,
        quantity,
        category
    })

    await productToSave.save()

    res.json("Product Added")

})

app.get("/getProducts", async (req, res) => {
    const products = await productModel.find()
    res.json(products)
})

app.get("/getProducts/:id", async (req, res) => {

    const id = req.params.id

    const product = await productModel.findOne({ id })
    res.json(product)
})



// Cart schema

const CartScmeha = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    items: [
        {
            id: String,
            file: String,
            title: String,
            desc: String,
            price: String,
            quantity: String,
            category: String
        }
    ],
    address: [
        {
            name: String,
            phone: String,
            address: String,
            country: String,
            state: String,
            city: String,
            zip: String
        }
    ],
})

const cartModel = model("cart", CartScmeha)

app.get("/getCart", async (req, res) => {

    const cart = await cartModel.find()

    res.json(cart)
})

app.post("/addToCart", async (req, res) => {

    let { userId, product } = req.body

    const cart = await cartModel.findOne({ userId });


    if (cart) {

        cart.items.push(product);
        await cart.save();
    } else {

        const newCart = new cartModel({
            userId,
            items: product
        })

        await newCart.save();
    }

    res.json("Product added to cart succesfully")
})

app.delete("/removeFromCart", async (req, res) => {
    const { userId, prodId } = req.body

    const cart = await cartModel.findOne({ userId })

    console.log(cart);

    const index = cart.items.findIndex(item => item.id === prodId);

    cart.items.splice(index, 1);

    await cart.save()

    res.json("Product removed from cart")
})

app.delete("/removeCart", async (req, res) => {
    const { userId } = req.body

    await cartModel.findOneAndDelete({ userId })

    res.json("Product removes from cart")
    console.log("removed from  cart");
})


function itemsToHtmlTable(items) {
    let html = '<table border="1"><tr><th>Item</th><th>Price</th></tr>';
    items.forEach(item => {
      html += `<tr><td>${item.title}</td><td>${item.price}</td></tr>`;
    });
    html += '</table>';
    return html;
  }

app.post("/setAddress", async (req, res) => {

    const { address, userId, userEmail } = req.body


    const cart = await cartModel.findOne({ userId })

    cart.address = address

    const newCart = await cart.save()

    
    const items = newCart.items
    const itemsText = items.map(item => `Item: ${item.title}, Quantity: ${item.desc}, Price: ${item.price}`).join('\n');

    const itemsHtml = itemsToHtmlTable(items);

    res.json("address succesfully added")


    transporter.sendMail({
        from: process.env.MAIL_USER,
        to: userEmail,
        subject: "Thank You for order, Your Order is Confirmed",
        text: `Thank you for your order. Here are the details:\n\n${itemsText}`,
        html: `<b>Thank you for your order. Here are the details:</b><br>${itemsHtml}`,
    }, (error, info) => {
        if (error) {
            return console.log('Error occurred:', error.message);
        }
        console.log('Message sent:', info.response);

    });
})

