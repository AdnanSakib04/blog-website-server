const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
// app.use(cors({
//   origin: [
//       'http://localhost:5173',
//       'https://blog-website-36dc4.web.app',
//       'https://blog-website-36dc4.firebaseapp.com'
//   ],
//   credentials: true
// }));


// 

// const corsOptions ={
//   origin:'*',
//   credentials:true,
//   optionSuccessStatus:200,
//   }
//   app.use(cors(corsOptions));

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

    //delete route for wishlist
    app.delete('/wishlist/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    })

    //get route for recent blogs
    app.get('/recentBlogs', async (req, res) => {
      const cursor = blogCollection.find().sort({ currentTime: -1 });
      const result = await cursor.toArray();
      res.send(result);
    })


    //put route for update blog
    app.put('/updateBlog/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedProduct = req.body;

      const blog = {
        $set: {
          title: updatedProduct.title,
          category: updatedProduct.category,
          photo: updatedProduct.photo,
          shortDescription: updatedProduct.shortDescription,
          longDescription: updatedProduct.longDescription,
        }
      }

      const result = await blogCollection.updateOne(filter, blog, options);
      res.send(result);
    })

    //get route for update blog
    app.get('/allblogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await blogCollection.findOne(query);
      res.send(result);
    })



    //get route for featured blogs
    const blog_limit = 10; // because i have to show 10 blogs
    app.get('/featuredBlogs', async (req, res) => {

      const cursor = blogCollection.find();
      const blogs = await cursor.toArray();

      // calculating word count of longDescription for each blog
      // sorting by word count in descending order
      const sortedBlogs = blogs
        .map((blog) => ({
          ...blog,
          wordCount: blog.longDescription.split(' ').length,
        }))
        .sort((a, b) => b.wordCount - a.wordCount)
        .slice(0, blog_limit);

      res.send(sortedBlogs);

    });


    //post route for add comment
    app.post('/addComment', async (req, res) => {
      const newComment = req.body;
      console.log(newComment);
      const result = await commentCollection.insertOne(newComment);
      res.send(result);
    })



    //get route for comments of a specific blog
    app.get('/comments/:blogId', async (req, res) => {
      const blogId = req.params.blogId;
      const query = { blogId: blogId }
      const cursor = commentCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })





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