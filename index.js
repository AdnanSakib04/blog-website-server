const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c4bcdgb.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const blogCollection = client.db('blogDB').collection('blogs');
    const wishlistCollection = client.db('blogDB').collection('wishlist');
    const commentCollection = client.db('blogDB').collection('comments');



    //post route for add blog
    app.post('/addblog', async (req, res) => {
      const newBlog = req.body;
      console.log(newBlog);
      const result = await blogCollection.insertOne(newBlog);
      res.send(result);
    })

    //get route for all blog
    app.get('/allblogs', async (req, res) => {
      const cursor = blogCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //post route for blog add to wishlist
    app.post('/wishlist', async (req, res) => {
      const wishlistBlog = req.body;
      console.log(wishlistBlog);
      const result = await wishlistCollection.insertOne(wishlistBlog);
      res.send(result);
    })

       //get route for wishlist
       app.get('/wishlist', async (req, res) => {
        const cursor = wishlistCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })


    // ---------------------------------------------------------------------------------
    //get route for brands
    app.get('/brands', async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    //post route for add products
    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    })


    //get route for specific brand
    app.get('/brands/:brand', async (req, res) => {
      const brand = req.params.brand;
      const query = { brand: brand }
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })


    // get route for product details
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find();
      const products = await cursor.toArray();
      res.send(products);
    })

    //get route for update product
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.findOne(query);
      res.send(result);
    })

    //put route for update products
    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedProduct = req.body;

      const product = {
        $set: {
          name: updatedProduct.name,
          brand: updatedProduct.brand,
          photo: updatedProduct.photo,
          rating: updatedProduct.rating,
          price: updatedProduct.price,
          type: updatedProduct.type,
        }
      }

      const result = await productCollection.updateOne(filter, product, options);
      res.send(result);
    })

    //post route for product add to cart
    app.post('/cart', async (req, res) => {
      const cartProduct = req.body;
      console.log(cartProduct);
      const result = await cartCollection.insertOne(cartProduct);
      res.send(result);
    })

    //get route for cart
    app.get('/cart', async (req, res) => {
      const cursor = cartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    //delete route for cart
    app.delete('/cart/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })
    // ---------------------------------------------------------------------------------


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close(); 
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Blogs server is running')
})

app.listen(port, () => {
  console.log(`Blogs server is running on port: ${port}`)
})