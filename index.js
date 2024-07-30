import express from 'express'
import cors from 'cors'
import mongoose, { model, Schema } from 'mongoose'
import bodyParser from 'body-parser'

// import path from 'path'
// import multer from 'multer'
// import { fileURLToPath } from 'url'

const app = express()
const port = 3000

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
app.use(bodyParser.json());
app.use(cors({ origin: "*" }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


mongoose.connect("mongodb+srv://Erfan:ERFAN123AALAM@erfan.1vy9lat.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Erfan")
    .then(() => {
        console.log("Connected succesfully");
        app.listen(port, () => {
            console.log("Server Started at port Number : " + port);
        })
    })



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
    let { id, file, title, desc, price } = req.body
    // let file = req.file.path
    // console.log(id,file);

    const productToSave = new productModel({
        id,
        file,
        title,
        desc,
        price
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
            price: String
        }
    ]
})

const cartModel = model("cart",CartScmeha)

app.get("/getCart",async(req,res)=>{

    const cart = await cartModel.find()

    res.json(cart)
})

app.post("/addToCart",async(req,res)=>{

    let {userId, product} = req.body

    const cart = await cartModel.findOne({ userId });


    if (cart) {

        cart.items.push(product);
        await cart.save();
      } else {

        const newCart = new cartModel({
            userId,
            items:product
        })

        await newCart.save();
      }

      res.json("Product added to cart succesfully")
})

app.delete("/removeFromCart",async(req,res)=>{
     const {userId, prodId} = req.body

    const cart = await cartModel.findOne({userId})

    const index = cart.items.findIndex(item => item.id === prodId);

    // cart.items = cart.items.filter((item)=>{
    //     return item.id !== prodId
    // })

    cart.items.splice(index, 1); 
    
    await cart.save()

    res.json("Product removed from cart")
})

app.delete("/removeCart",async(req,res)=>{
    const {userId} = req.body

    await cartModel.findOneAndDelete({userId})

    res.json("Product removes from cart")
    console.log("removed from  cart");
})


