const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();


//middleware
app.use(cors());
app.use(express.json());

//mongo connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qzbsy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("Lumos_DB");
      const lightCollection = database.collection("lights");
      const userCollection = database.collection("users");
      const reviewCollection = database.collection('reviews');
      const orderCollection = database.collection('orders');
      

      //get api
      app.get('/lights', async(req,res) => {
        const cursor = lightCollection.find({});
        const lights = await cursor.toArray();
        res.send(lights);
     })
    
     //get single product using id
     app.get('/lights/:id', async(req,res) => {
       const id = req.params.id;
       const query = { _id: ObjectId(id)};
       const light = await lightCollection.findOne(query);
       res.send(light);
     })

     //post products
     app.post('/lights', async(req,res) => {
      const light = req.body;
      const result = await lightCollection.insertOne(light);
      // console.log(user);
      // console.log(result);
      res.json(result);
    })

     //delete a product
     app.delete('/lights/:id', async(req,res) => {
       const id = req.params.id;
       const query = { _id: ObjectId(id)};
       const result = await lightCollection.deleteOne(query);
       //console.log(result);
       res.json(result);
     })

      //get users
      app.get('/users', async(req,res) => {

        const cursor = userCollection.find({});
        const users = await cursor.toArray();
        res.send(users);
     })
     
     //admin checking through email
     app.get('/users/:email', async(req,res) => {
      const email = req.params.email;
      const query = {email : email};
      console.log(query);
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if(user?.role === 'admin'){
        isAdmin = true;
      }
      res.json({admin: isAdmin});
    })
     //adding users to database
     app.post('/users', async(req,res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      // console.log(user);
      // console.log(result);
      res.json(result);
    })
     
   
    //updating role of a user
    app.put('/users/admin', async(req,res) => {
      const user = req.body;
      const filter = {email: user.email};
      const updateDoc = {$set: {role : 'admin'}};
      const result = await userCollection.updateOne(filter,updateDoc);
      res.json(result);
    }) 
    
    app.get('/reviews', async(req,res) => {

      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
   })
    //add review to db
    app.post('/reviews', async(req,res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      // console.log(review);
      // console.log(result);
      res.json(result);
    })
     
    //add orders to db
    app.post('/orders', async(req,res) => {
      const order = req.body;
      let date = new Date();
      order.createdAt = date.toLocaleDateString("en-US");
      const result = await orderCollection.insertOne(order);
      res.json(result);
    })
    //get orders
    app.get('/orders', async(req,res) => {
      let query = {};
      const email = req.query.email;
      if(email){
        query = {email : email};
      }
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.json(orders);
   })

   //update order status
   app.put('/orders/:id', async(req,res) => {
     const id = req.params.id;
     const updatedOrder = req.body;
     const filter = {_id: ObjectId(id)};
     const options = { upsert: true};
     const updatedDoc = {
       $set: {
         status : updatedOrder.status
       },
     };
     const result = await orderCollection.updateOne(filter,updatedDoc,options)
     res.json(result);
   })

   app.delete('/orders/:id', async(req,res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id)};
    const result = await orderCollection.deleteOne(query);
    //console.log(result);
    res.json(result);
  })

    } finally {
      //await client.close();
    }
  }
  run().catch(console.dir);
  
  

app.get('/',(req,res) => {
    res.send("Lumos Server")
})

app.listen(port, () => {
    console.log('Example app listening at ', port);
})